Plano de re-projeto orientado a performance

Objetivo: Manter todas as funcionalidades, remover/mitigar dependências nativas no fluxo principal, e melhorar capacidade de testes/CI.

Prioridades
1. Ambiente reproducível
   - Fixar Node 18 (`.nvmrc` já adicionado)
   - Adicionar CI (Node 18, npm ci, tsc, lint, tests)
2. Isolar/Remover dependências nativas
   - Migrar `sharp` para devDependencies (já feito)
   - Tornar scripts de geração de imagens opcionais (já feito)
   - Para OCR: avaliar migrar `expo-text-recognition` para Tesseract.js (web) ou serviço de OCR na nuvem (Google Vision, AWS Textract) com fallback
3. Modularização
   - Separar pipelines pesadas (ícones, otimização de imagens) em um pacote/CLI ou job serverless
   - Documentar etapas manuais (SETUP.md) para reproduzir geracao de assets quando necessário
4. Performance & experiência
   - Lazy-load de módulos pesados na app (dynamic import)
   - Otimização de assets (WebP para web, compressão adaptativa)
   - Medir e criar benchmarks (expo-devtools, Lighthouse para web)
5. CI/CD e testes
   - Garantir que `npm ci && npm test` passem sem precisar de ferramentas nativas
   - Adicionar jobs de integração se necessários (e.g., build mobile em runner que suporte native deps)

Entregáveis iniciais
- `.github/workflows/ci.yml` (CI básico)
- `SETUP.md` com passos de instalação e troubleshooting
- Migração e testes das mudanças e PRs iterativos

Próximos passos (pra iniciar)
- Criar workflow de CI (feito a seguir)
- Executar `npm ci` e `npm test` em ambiente controlado (você pode executar localmente ou eu configuro GitHub Actions)
- Planejar migração do OCR (proposta e POC)