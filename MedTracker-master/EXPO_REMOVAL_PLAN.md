# RFC: Remover Expo do projeto MedTracker

**Resumo:**
Este documento descreve um plano detalhado para remover o Expo do projeto, migrando para uma base React Native "pura" (bare workflow) e substituindo APIs específicas do Expo por equivalentes de terceiros (por exemplo, `react-native-vision-camera` para câmera e uma biblioteca OCR nativa). A remoção será feita em etapas, com PRs pequenos, testes e um plano de rollback.

---

## Motivação
- Remover dependências nativas de alto acoplamento com o Expo para ganhar mais controle sobre builds nativos, reduzir riscos de compatibilidade e permitir integração com bibliotecas nativas de alto desempenho.
- Facilitar a instrumentação de performance e o uso de bibliotecas nativas para OCR e Vision Camera.

## Escopo
- **Incluído:** remover dependências `expo*`, `expo-router`, migrar APIs de câmera, reconhecimento de texto, gerenciamento de assets, e os scripts/configs que dependem do Expo.
- **Excluído (não tratado aqui):** reescrita completa do app UI; integração com lojas (app store) e reconfiguração de pipelines CI para builds nativos (será etapa posterior).

## Riscos
- Quebra de imports e funcionalidades (navegação, assets, permissões). Necessidade de testes em simuladores/ dispositivos físicos.
- Aumento de esforço inicial e necessidade de runners com suporte ao build nativo para CI.

## Estratégia (alto nível)
1. **Avaliação e inventário** (1 dia)
   - Identificar todos os pontos de uso do Expo (package.json, imports `expo-*`, `expo-router`, `expo-camera`, `expo-text-recognition`, etc.).
   - Mapear alternativos equivalentes (camera, notifications, updates, splash, assets).

2. **POCs e wrappers** (2–4 dias)
   - Implementar wrappers `lib/*` para funcionalidades críticas: Camera, OCR, FileSystem. Inicialmente manter implementação que usa Expo se disponível e fallback nativo/terceiro quando não estiver.
   - Validar que os wrappers tenham testes unitários.

3. **Remover Expo (PRs iterativos)** (variável)
   - PR A: Remover `expo-router` e migrar para `react-navigation` (ou configurar roteamento manual). (isolado)
   - PR B: Substituir `expo-camera` por `react-native-vision-camera` (com instruções de instalação nativa). (isolado)
   - PR C: Substituir `expo-text-recognition` por uma biblioteca OCR nativa ou wrapper que chame serviços OCR. (isolado)
   - PR D: Limpar `app.json` / config expo e remover `expo` packages do `package.json`.

4. **Testes e validação** (contínuo)
   - Testes unitários, E2E (determinados fluxos), testes manuais em dispositivos Android/iOS.

5. **CI e docs**
   - Atualizar `README` / `SETUP.md` com instruções de builds nativos e requisitos (Android SDK, Xcode, etc.).
   - Configurar runner que suporte builds nativos quando for necessário (separado).

## Checklist de remoção (tarefa por tarefa)
- [ ] Listar todos os imports `expo-*` e files que utilizam APIs Expo
- [ ] Implementar wrappers com fallback (lib/camera.ts, lib/ocr.ts, lib/files.ts)
- [ ] Migrar navegação `expo-router` para `react-navigation`
- [ ] Substituir `expo-camera` por `react-native-vision-camera` (ou similar)
- [ ] Substituir `expo-text-recognition` por uma biblioteca OCR nativa / wrappers nativos
- [ ] Atualizar scripts e CI para não depender do `expo` cli
- [ ] Atualizar documentação e instruções de build
- [ ] Testar em Android e iOS (simulador & device)
- [ ] Remover dependências Expo e arquivos config

## Planejamento de PRs
- Criar PRs pequenos e independentes (cada API/feature por PR) com checklist e instruções de teste claro.
- Manter um PR de planejamento (RFC) para coordenar alterações mais disruptivas.

## Rollback
- Se um PR causar regressão crítica, reverter PR e abrir um issue com passos reprodutíveis.

## Estimativa de esforço
- Avaliação inicial e wrappers: 1–4 dias
- Migração da navegação: 1–2 dias
- Substituição de camera e OCR: 3–7 dias (depende de testes manuais e configuração nativa)

---

**Observação:** Recomenda-se manter o trabalho de remoção do Expo em branches/PRs separadas e não mergear tudo de uma vez; priorizar funcionalidades críticas (câmera/ocr) primeiro.
