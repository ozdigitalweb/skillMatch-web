// ============================================================
// UI.JS - INTERFACE (DOM)
// ------------------------------------------------------------
// Este módulo é o único que toca em elementos HTML diretamente.
// Ele lê o formulário, valida, renderiza os cards de resultado
// e mostra os 3 estados do carregamento (carregando/vazio/erro).
//
// motor.js e dados.js não sabem que existe uma tela - só
// devolvem dados prontos para este módulo desenhar.
// Cada card é criado via document.createElement (não usamos
// innerHTML com template string) para evitar risco de XSS e
// manter o controle sobre cada elemento criado.

// ============================================================

// ---- Referências aos elementos do HTML (cacheadas uma vez) ----
const formulario      = document.getElementById("form-perfil");
const campoNome       = document.getElementById("campo-nome");
const campoArea       = document.getElementById("campo-area");
const campoExperiencia = document.getElementById("campo-experiencia");
// As habilidades agora são várias caixas de marcação com o mesmo "name"
const checkboxesHabilidades = document.querySelectorAll('input[name="habilidades"]');

const regiaoStatus    = document.getElementById("status-vagas");   // aria-live
const listaResultados = document.getElementById("lista-resultados");
const destaqueMelhor  = document.getElementById("destaque-melhor");
const recomendacaoEl  = document.getElementById("recomendacao-estudo");
const contadorEl      = document.getElementById("contador-analises");
const estadoInicial   = document.getElementById("estado-inicial");
const listaHistorico  = document.getElementById("lista-historico");
const botaoLimparHistorico = document.getElementById("botao-limpar-historico");


// ============================================================
// RF10 - FORMULÁRIO: leitura, validação e preenchimento
// ============================================================

/**
 * Lê os valores atuais do formulário e monta um objeto de
 * perfil no mesmo formato usado pelo motor (RF01).
 *
 * @returns {object}
 */
export function obterPerfilDoFormulario() {
  // filter + map: pega só as caixas marcadas e extrai o "value" de cada uma
  const habilidades = Array.from(checkboxesHabilidades)
    .filter((caixa) => caixa.checked)
    .map((caixa) => caixa.value);

  return {
    nome: campoNome.value.trim(),
    area: campoArea.value,
    habilidades,
    experienciaMeses: Number(campoExperiencia.value) || 0,
  };
}

/**
 * Preenche o formulário com um perfil salvo anteriormente
 * (usado ao carregar o perfil do localStorage).
 *
 * @param {object} perfil
 */
export function preencherFormulario(perfil) {
  if (!perfil) return;

  // Se a propriedade não existir, usamos um valor padrão (if/else
  // simples, em vez do operador "??" que ainda não vimos em aula).
  campoNome.value = perfil.nome ? perfil.nome : "";
  campoArea.value = perfil.area ? perfil.area : "";

  // forEach: marca cada caixa cujo "value" está na lista de habilidades salvas
  checkboxesHabilidades.forEach((caixa) => {
    if (perfil.habilidades && perfil.habilidades.includes(caixa.value)) {
      caixa.checked = true;
    } else {
      caixa.checked = false;
    }
  });

  if (perfil.experienciaMeses) {
    campoExperiencia.value = perfil.experienciaMeses;
  } else {
    campoExperiencia.value = "";
  }
}

/**
 * Valida os campos obrigatórios do perfil.
 *
 * @param   {object} perfil
 * @returns {string[]} lista de mensagens de erro (vazia se válido)
 */
export function validarPerfil(perfil) {
  const erros = [];

  if (!perfil.nome) erros.push("Informe seu nome.");
  if (!perfil.area) erros.push("Informe sua área de atuação.");
  if (perfil.habilidades.length === 0) {
    erros.push("Selecione ao menos uma habilidade.");
  }

  return erros;
}

/**
 * Registra o callback de envio do formulário.
 * addEventListener + preventDefault: evita o recarregamento
 * padrão da página ao enviar o form.
 *
 * @param {function(SubmitEvent): void} aoEnviar
 */
export function aoEnviarFormulario(aoEnviar) {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    aoEnviar(evento);
  });
}


/**
 * Esconde o bloco de instruções "Como usar", exibido só até a
 * primeira consulta ser feita.
 */
export function ocultarEstadoInicial() {
  estadoInicial.hidden = true;
}


// ============================================================
// RF13 - OS 3 ESTADOS: carregando / vazio / erro
// ============================================================

/**
 * Mostra o estado de carregamento na região de status.
 * aria-live="polite" (definido no HTML) faz leitores de tela
 * anunciarem essa mudança automaticamente.
 */
export function mostrarCarregando() {
  regiaoStatus.textContent = "Carregando vagas...";
  regiaoStatus.hidden = false;
  listaResultados.innerHTML = "";
}

/**
 * Mostra o estado de "nenhuma vaga encontrada".
 */
export function mostrarVazio() {
  regiaoStatus.textContent = "Nenhuma vaga foi encontrada no momento.";
  regiaoStatus.hidden = false;
}

/**
 * Mostra uma mensagem de erro amigável.
 * @param {string} mensagem
 */
export function mostrarErro(mensagem) {
  regiaoStatus.textContent = `Não foi possível carregar as vagas: ${mensagem}`;
  regiaoStatus.hidden = false;
}

/**
 * Esconde a região de status quando os resultados já foram
 * renderizados com sucesso.
 */
export function esconderStatus() {
  regiaoStatus.hidden = true;
  regiaoStatus.textContent = "";
}


// ============================================================
// RF11 - RENDERIZAÇÃO DINÂMICA DOS CARDS (createElement)
// ============================================================

/**
 * Cria o elemento HTML de um card de resultado.
 * createElement + classList: nenhum HTML é escrito à mão aqui,
 * tudo é montado via DOM.
 *
 * @param   {object} resultado - retorno de vaga.calcularCompatibilidade()
 * @returns {HTMLElement}
 */
function criarCardResultado(resultado) {
  const classe = classeCss(resultado.classificacao);
  const totalRequisitos = resultado.encontradas.length + resultado.faltantes.length;

  const card = document.createElement("article");
  card.classList.add("card-vaga");

  // ---- cabeçalho: nome da vaga + selo de classificação ----
  const cabecalho = document.createElement("div");
  cabecalho.classList.add("card-vaga__cabecalho");

  const infoVaga = document.createElement("div");
  const titulo = document.createElement("h3");
  titulo.textContent = resultado.resumo;
  infoVaga.appendChild(titulo);

  const meta = document.createElement("p");
  meta.classList.add("card-vaga__meta");
  meta.textContent = resultado.modalidade + " · R$ " + resultado.salario;
  infoVaga.appendChild(meta);
  cabecalho.appendChild(infoVaga);

  const selo = document.createElement("span");
  selo.classList.add("selo", `selo--${classe}`);
  selo.textContent = resultado.classificacao;
  cabecalho.appendChild(selo);

  card.appendChild(cabecalho);

  // ---- percentual em destaque + barra de progresso ----
  const percentualBloco = document.createElement("div");
  percentualBloco.classList.add("card-vaga__percentual-bloco");

  const percentualNumero = document.createElement("span");
  percentualNumero.classList.add("card-vaga__percentual-numero", `texto--${classe}`);
  percentualNumero.textContent = `${resultado.percentual}%`;
  percentualBloco.appendChild(percentualNumero);

  const percentualLabel = document.createElement("span");
  percentualLabel.classList.add("card-vaga__percentual-label");
  percentualLabel.textContent = `${resultado.encontradas.length}/${totalRequisitos} habilidades`;
  percentualBloco.appendChild(percentualLabel);

  card.appendChild(percentualBloco);

  const barraTrack = document.createElement("div");
  barraTrack.classList.add("barra-progresso");
  const barraFill = document.createElement("div");
  barraFill.classList.add("barra-progresso__fill", `barra-progresso__fill--${classe}`);
  barraFill.style.width = `${resultado.percentual}%`;
  barraTrack.appendChild(barraFill);
  card.appendChild(barraTrack);

  // ---- tags de habilidade: encontradas (✓) e faltantes (+) ----
  const tags = document.createElement("div");
  tags.classList.add("tags-habilidades");

  resultado.encontradas.forEach((habilidade) => {
    const tag = document.createElement("span");
    tag.classList.add("tag", "tag--encontrada");
    tag.textContent = `✓ ${habilidade}`;
    tags.appendChild(tag);
  });

  resultado.faltantes.forEach((habilidade) => {
    const tag = document.createElement("span");
    tag.classList.add("tag", "tag--faltante");
    tag.textContent = `+ ${habilidade}`;
    tags.appendChild(tag);
  });

  card.appendChild(tags);

  return card;
}

/** Converte a classificação em uma palavra-chave de CSS. */
function classeCss(classificacao) {
  if (classificacao.startsWith("Alta")) return "alta";
  if (classificacao.startsWith("Média")) return "media";
  return "baixa";
}

/**
 * Renderiza a lista completa de cards de resultado.
 * @param {object[]} resultados
 */
export function renderizarResultados(resultados) {
  listaResultados.innerHTML = ""; // limpa antes de renderizar de novo

  if (resultados.length === 0) {
    mostrarVazio();
    return;
  }

  esconderStatus();

  // forEach: percorre e adiciona cada card na lista
  resultados.forEach((resultado) => {
    listaResultados.appendChild(criarCardResultado(resultado));
  });
}

/**
 * Renderiza o destaque da vaga mais compatível.
 * @param {object|null} melhor
 */
export function renderizarMelhorVaga(melhor) {
  destaqueMelhor.innerHTML = ""; // limpa antes de renderizar de novo

  if (!melhor) return;

  const classe = classeCss(melhor.classificacao);

  const selo = document.createElement("span");
  selo.classList.add("destaque-melhor__selo");
  selo.textContent = "★ Vaga mais compatível para você";
  destaqueMelhor.appendChild(selo);

  const titulo = document.createElement("p");
  titulo.classList.add("destaque-melhor__titulo");
  titulo.textContent = melhor.resumo;
  destaqueMelhor.appendChild(titulo);

  const percentual = document.createElement("p");
  percentual.classList.add("destaque-melhor__percentual", `texto--${classe}`);
  percentual.textContent = `${melhor.percentual}% de compatibilidade`;
  destaqueMelhor.appendChild(percentual);
}

/**
 * Renderiza a recomendação de estudo.
 * @param {string} texto
 */
export function renderizarRecomendacao(texto) {
  recomendacaoEl.textContent = texto;
}

/**
 * Atualiza o contador de análises feitas na sessão (RF08 - closure).
 * @param {number} numero
 */
export function renderizarContador(numero) {
  contadorEl.textContent = `Análises realizadas nesta sessão: ${numero}`;
}


// ============================================================
// HISTÓRICO DE CONSULTAS
// ============================================================

/**
 * Formata uma data ISO (ex.: "2026-07-18T14:30:00.000Z") como
 * "18/07/2026 às 14:30", usando só métodos básicos do objeto
 * Date - sem toLocaleString(), pra ficar dentro do que já vimos.
 *
 * @param   {string} dataIso
 * @returns {string}
 */
function formatarData(dataIso) {
  const data = new Date(dataIso);

  // padStart: garante 2 dígitos (ex.: "5" -> "05")
  const dia    = String(data.getDate()).padStart(2, "0");
  const mes    = String(data.getMonth() + 1).padStart(2, "0"); // getMonth() começa em 0
  const ano    = data.getFullYear();
  const horas  = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}

/**
 * Renderiza a lista de consultas anteriores (mais recente primeiro).
 * @param {object[]} historico
 */
export function renderizarHistorico(historico) {
  listaHistorico.innerHTML = ""; // limpa antes de renderizar de novo

  if (historico.length === 0) {
    const vazio = document.createElement("li");
    vazio.classList.add("item-historico__vazio");
    vazio.textContent = "Nenhuma consulta registrada ainda neste navegador.";
    listaHistorico.appendChild(vazio);
    return;
  }

  // forEach: percorre o histórico e cria um item de lista para cada consulta
  historico.forEach((consulta) => {
    const item = document.createElement("li");
    item.classList.add("item-historico");

    const quem = document.createElement("p");
    quem.classList.add("item-historico__quem");
    quem.textContent = `${consulta.nome} — ${consulta.area}`;
    item.appendChild(quem);

    const resultado = document.createElement("p");
    resultado.classList.add("item-historico__resultado");
    resultado.textContent = `Melhor vaga: ${consulta.melhorVaga} (${consulta.percentual}%)`;
    item.appendChild(resultado);

    const quando = document.createElement("p");
    quando.classList.add("item-historico__quando");
    quando.textContent = formatarData(consulta.dataHora);
    item.appendChild(quando);

    listaHistorico.appendChild(item);
  });
}

/**
 * Registra o callback de clique no botão "Limpar histórico".
 * Mesmo padrão do aoEnviarFormulario: quem decide o que fazer é
 * a função (callback) passada por quem chama esta função.
 *
 * @param {function(): void} aoClicar
 */
export function aoClicarLimparHistorico(aoClicar) {
  botaoLimparHistorico.addEventListener("click", aoClicar);
}
