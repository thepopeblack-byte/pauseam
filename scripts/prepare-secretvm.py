"""Generate deployable Compose from actual registry digests, without secrets.

No VM is launched. Use the verified separate ASR buckets and official text repo.
Supply HF_TOKEN and service tokens through encrypted host settings. Never paste a token into a command or include it in this file.
"""
import argparse
import json
from pathlib import Path
import re


def image(value):
    if not re.fullmatch(r"ghcr\.io/[a-z0-9_/-]+@sha256:[0-9a-f]{64}", value):
        raise argparse.ArgumentTypeError("Supply an actual digest-pinned GHCR image")
    return value


def compose(text_image=None, asr_image=None, profile="full"):
    if profile not in ("full", "english-pilot", "english-complete"):
        raise ValueError("Unknown deployment profile")
    if profile in ("full", "english-complete") and not text_image:
        raise ValueError("Full profile requires a text image")
    if profile in ("english-pilot", "english-complete") and not asr_image:
        raise ValueError("English pilot requires an ASR image")
    include_text = profile != "english-pilot"
    compact = profile == "english-complete"
    languages = ("en",) if profile != "full" else ("en", "yo", "ha", "ig")
    root = Path(__file__).resolve().parent.parent
    sources = json.loads((root / "deployment/models/approved-sources.json").read_text())
    proxy = ['  $DOMAIN_NAME {', '    request_body {', '      max_size 1MB', '    }',
             '    header Cache-Control "no-store"']
    if include_text:
        proxy.extend(['    handle_path /text/* {', '      reverse_proxy text:8000', '    }'])
    if asr_image:
        for lang in languages:
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
    if include_text:
        lines.extend(['  text:', f'    image: {text_image}', '    restart: "on-failure:3"',
        '    mem_limit: ' + ('10g' if compact else '20g'), '    read_only: true', '    cap_drop: [ALL]',
        '    security_opt: [no-new-privileges:true]', '    tmpfs: ["/tmp:size=512m"]',
        '    expose: ["8000"]', '    volumes: ["text-models:/home/app/models", "licence:/home/app/license"]',
        '    environment:', '      MODEL_REVISION: e294476928aca9030e924ca27bb8e085e8581273',
        '      TEXT_DTYPE: bfloat16', '      MODEL_THREADS: "4"',
        '      HF_HOME: /home/app/models/hf', '      VERIFIED_MODEL_CACHE: /home/app/models/verified',
        '      LICENSE_DB: /home/app/license/usage.sqlite',
        '      MODEL_BUCKET_ID: ""',
        '      MODEL_BUCKET_PREFIX: ""',
        '      HF_TOKEN: ${HF_TOKEN:-}', '      TEXT_SERVICE_TOKEN: ${TEXT_SERVICE_TOKEN:?Set privately}',
        '    healthcheck:', '      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen(\'http://127.0.0.1:8000/ready\', timeout=5)"]',
        '      interval: 30s', '      timeout: 10s', '      retries: 5', '      start_period: 60m'])
        if compact:
            at = lines.index('      TEXT_DTYPE: bfloat16')
            lines[at:at+1] = ['      QUANTIZED_MODEL_CACHE: /home/app/models/quantized']
    if asr_image:
        for lang in languages:
            revision = json.loads((root/'asr'/'manifests'/(lang+'.json')).read_text(encoding='utf-8'))['revision']
            lines.extend([f'  asr-{lang}:', f'    image: {asr_image}', '    restart: "on-failure:3"',
                '    mem_limit: ' + ('3g' if compact else '4g' if profile == 'english-pilot' else '2300m'), '    read_only: true', '    cap_drop: [ALL]',
                '    security_opt: [no-new-privileges:true]', '    tmpfs: ["/tmp:size=128m"]',
                '    expose: ["8000"]', f'    volumes: ["asr-{lang}-models:/home/inference/models", "licence:/home/inference/license"]',
                '    environment:', f'      MODEL_LANGUAGE: {lang}', f'      MODEL_REVISION: {revision}',
                '      MODEL_THREADS: "2"' if compact else '      MODEL_THREADS: "4"' if profile == 'english-pilot' else '      MODEL_THREADS: "1"', '      HF_HOME: /home/inference/models/hf',
                '      VERIFIED_MODEL_CACHE: /home/inference/models/verified',
                '      LICENSE_DB: /home/inference/license/usage.sqlite', '      HF_TOKEN: ${HF_TOKEN:-}',
                f'      MODEL_BUCKET_ID: {sources[lang]["bucket"]}',
                '      MODEL_BUCKET_PREFIX: ""',
                '      ASR_SERVICE_TOKEN: ${ASR_SERVICE_TOKEN:?Set privately}',
                '    healthcheck:', '      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen(\'http://127.0.0.1:8000/ready\', timeout=5)"]',
                '      interval: 30s', '      timeout: 10s', '      retries: 5', '      start_period: 60m'])
    lines.extend(['volumes:'])
    if include_text:
        lines.append('  text-models:')
    lines.extend(['  licence:', '  caddy-data:', '  caddy-config:'])
    if asr_image:
        lines.extend(f'  asr-{lang}-models:' for lang in languages)
    return '\n'.join(lines)+'\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--profile', choices=('full','english-pilot','english-complete'), default='full')
    parser.add_argument('--text-image', type=image)
    parser.add_argument('--asr-image', type=image)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    if args.profile in ('full','english-complete') and not args.text_image:
        parser.error('Full profile requires --text-image')
    if args.profile in ('english-pilot','english-complete') and not args.asr_image:
        parser.error('English pilot requires --asr-image')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(compose(args.text_image, args.asr_image, args.profile), encoding='utf-8')
    print('Compose written; no credentials or VM purchase performed.')
