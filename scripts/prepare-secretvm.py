"""Generate deployable Compose from actual registry digests, without secrets.

No VM is launched. Text-only is the default until ASR access is available.
Supply MODEL_BUCKET_ID / HF_TOKEN and service tokens through encrypted host
settings. Never paste a token into a command or include it in this file.
"""
import argparse
from pathlib import Path
import re


def image(value):
    if not re.fullmatch(r"ghcr\.io/[a-z0-9_/-]+@sha256:[0-9a-f]{64}", value):
        raise argparse.ArgumentTypeError("Supply an actual digest-pinned GHCR image")
    return value


def compose(text_image, asr_image=None, bucket_id=None):
    proxy = ['  $DOMAIN_NAME {', '    request_body {', '      max_size 1MB', '    }',
             '    header Cache-Control "no-store"', '    handle_path /text/* {',
             '      reverse_proxy text:8000', '    }']
    if asr_image:
        for lang in ("en", "yo", "ha", "ig"):
            proxy.extend([f'    handle_path /asr/{lang}/* {{', f'      reverse_proxy asr-{lang}:8000', '    }'])
    proxy.extend(['    handle {', '      respond "PauseAm model gateway" 404', '    }', '  }'])
    lines = ['services:', '  gateway:',
        '    image: caddy:2@sha256:0c994536bddb66445885237f1a5dcc1916bccea922661c76b4e9fc24061f9b52',
        '    restart: unless-stopped', '    mem_limit: 256m', '    read_only: true',
        '    cap_drop: [ALL]', '    cap_add: [NET_BIND_SERVICE]',
        '    security_opt: [no-new-privileges:true]', '    tmpfs: [/tmp]',
        '    ports: ["80:80", "443:443"]', '    volumes: ["caddy-data:/data", "caddy-config:/config"]',
        '    entrypoint: ["/bin/sh", "-c"]',
        '    command:', '      - |', "        cat > /tmp/Caddyfile <<'CADDYFILE'"]
    lines.extend('        '+line for line in proxy)
    lines.extend(['        CADDYFILE', '        exec caddy run --config /tmp/Caddyfile --adapter caddyfile'])
    lines.extend(['  text:', f'    image: {text_image}', '    restart: "on-failure:3"',
        '    mem_limit: 20g', '    read_only: true', '    cap_drop: [ALL]',
        '    security_opt: [no-new-privileges:true]', '    tmpfs: ["/tmp:size=512m"]',
        '    expose: ["8000"]', '    volumes: ["text-models:/home/app/models", "licence:/home/app/license"]',
        '    environment:', '      MODEL_REVISION: e294476928aca9030e924ca27bb8e085e8581273',
        '      TEXT_DTYPE: bfloat16', '      MODEL_THREADS: "4"',
        '      HF_HOME: /home/app/models/hf', '      VERIFIED_MODEL_CACHE: /home/app/models/verified',
        '      LICENSE_DB: /home/app/license/usage.sqlite',
        '      MODEL_BUCKET_ID: ${MODEL_BUCKET_ID:-'+(bucket_id or '')+'}',
        '      MODEL_BUCKET_PREFIX: ${MODEL_BUCKET_PREFIX:-'+('text' if bucket_id else '')+'}',
        '      HF_TOKEN: ${HF_TOKEN:-}', '      TEXT_SERVICE_TOKEN: ${TEXT_SERVICE_TOKEN:?Set privately}',
        '    healthcheck:', '      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen(\'http://127.0.0.1:8000/ready\', timeout=5)"]',
        '      interval: 30s', '      timeout: 10s', '      retries: 5', '      start_period: 60m'])
    if asr_image:
        import json
        root = Path(__file__).resolve().parent.parent
        for lang in ("en", "yo", "ha", "ig"):
            revision = json.loads((root/'asr'/'manifests'/(lang+'.json')).read_text(encoding='utf-8'))['revision']
            lines.extend([f'  asr-{lang}:', f'    image: {asr_image}', '    restart: "on-failure:3"',
                '    mem_limit: 2300m', '    read_only: true', '    cap_drop: [ALL]',
                '    security_opt: [no-new-privileges:true]', '    tmpfs: ["/tmp:size=128m"]',
                '    expose: ["8000"]', f'    volumes: ["asr-{lang}-models:/home/inference/models", "licence:/home/inference/license"]',
                '    environment:', f'      MODEL_LANGUAGE: {lang}', f'      MODEL_REVISION: {revision}',
                '      MODEL_THREADS: "1"', '      HF_HOME: /home/inference/models/hf',
                '      VERIFIED_MODEL_CACHE: /home/inference/models/verified',
                '      LICENSE_DB: /home/inference/license/usage.sqlite', '      HF_TOKEN: ${HF_TOKEN:-}',
                f'      MODEL_BUCKET_ID: ${{ASR_{lang.upper()}_BUCKET_ID:-{bucket_id or ""}}}',
                f'      MODEL_BUCKET_PREFIX: ${{ASR_{lang.upper()}_BUCKET_PREFIX:-{lang if bucket_id else ""}}}',
                '      ASR_SERVICE_TOKEN: ${ASR_SERVICE_TOKEN:?Set privately}',
                '    healthcheck:', '      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen(\'http://127.0.0.1:8000/ready\', timeout=5)"]',
                '      interval: 30s', '      timeout: 10s', '      retries: 5', '      start_period: 60m'])
    lines.extend(['volumes:', '  text-models:', '  licence:', '  caddy-data:', '  caddy-config:'])
    if asr_image:
        lines.extend(f'  asr-{lang}-models:' for lang in ("en", "yo", "ha", "ig"))
    return '\n'.join(lines)+'\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--text-image', required=True, type=image)
    parser.add_argument('--asr-image', type=image)
    parser.add_argument('--bucket-id', help='Optional public bucket with separate text/en/yo/ha/ig folders; folders must be verified before deployment')
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    if args.bucket_id and not re.fullmatch(r'[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+', args.bucket_id): parser.error('Invalid bucket ID')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(compose(args.text_image, args.asr_image,args.bucket_id), encoding='utf-8')
    print('Compose written; no credentials or VM purchase performed.')
