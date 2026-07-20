// ============================================================
// DADOS.JS - ACESSO A DADOS (FETCH + LOCALSTORAGE)
// ------------------------------------------------------------
// Este módulo é o único que "conversa" com o mundo de fora do
// JavaScript: busca o catálogo de vagas (simulando um servidor
// real, como no RF14 do mini-projeto original) e lê/grava o
// perfil do candidato no localStorage do navegador.
//
// motor.js e ui.js não sabem "de onde" os dados vêm - só pedem
// para este módulo e recebem o resultado pronto.
// ============================================================

import { VagaFrontEnd } from "./motor.js";

const CAMINHO_VAGAS      = "./assets/dados/vagas.json";
const CHAVE_LOCALSTORAGE = "skillmatch:perfil";
const CHAVE_HISTORICO    = "skillmatch:historico";
const MAXIMO_HISTORICO   = 10; // guarda só as 10 consultas mais recentes

// ============================================================
// RF13 - BUSCAR VAGAS (fetch + async/await)
// ============================================================

/**
 * Busca o catálogo de vagas em vagas.json e transforma cada
 * item (objeto simples) em uma instância de VagaFrontEnd, para
 * que já venha com o método calcularCompatibilidade() pronto.
 *
 * PROMISE / ASYNC-AWAIT: fetch() devolve uma Promise. "await"
 * pausa a função até essa Promise ser resolvida (ou rejeitada).
 *
 * Esta função representa a arquitetura cliente-servidor: mesmo
 * sendo um arquivo local, o fluxo (pedido -> espera -> resposta)
 * é o mesmo de uma chamada a uma API remota.
 *
 * @returns {Promise<VagaFrontEnd[]>}
 * @throws {Error} se a rede falhar ou o arquivo não existir
 */
export async function buscarVagas() {
  const resposta = await fetch(CAMINHO_VAGAS);

  // response.ok é false para respostas como 404 ou 500
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar as vagas (HTTP ${resposta.status}).`);
  }

  const dadosBrutos = await resposta.json();

  // map: transforma cada objeto simples do JSON em uma VagaFrontEnd
  return dadosBrutos.map(
    (v) =>
      new VagaFrontEnd(
        v.id,
        v.empresa,
        v.cargo,
        v.requisitos,
        v.salario,
        v.modalidade,
        v.nivel
      )
  );
}


// ============================================================
// RF14 - PERSISTÊNCIA COM LOCALSTORAGE
// ============================================================

/**
* Salva o perfil do candidato no localStorage, convertendo o
 * objeto em texto (JSON.stringify), já que localStorage só
 * guarda strings. O mesmo vale para o histórico: é preciso
 * usar JSON.parse() para transformar o texto salvo de volta
 * em objeto/array ao recuperar.
 *
 * @param {object} perfil
 */
export function salvarPerfil(perfil) {
  localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(perfil));
}

/**
 * Recupera o perfil salvo anteriormente, ou null se for a
 * primeira visita (ou se os dados salvos estiverem corrompidos).
 *
 * @returns {object|null}
 */
export function carregarPerfil() {
  const bruto = localStorage.getItem(CHAVE_LOCALSTORAGE);

  // Primeira visita: getItem devolve null, não lança erro
  if (bruto === null) return null;

  try {
    return JSON.parse(bruto);
  } catch (erro) {
    // Dado corrompido/manual no localStorage: ignora com segurança
    console.warn("Perfil salvo estava corrompido e foi ignorado.", erro);
    return null;
  }
}

/**
 * Remove o perfil salvo (útil para um botão "limpar dados").
 */
export function limparPerfil() {
  localStorage.removeItem(CHAVE_LOCALSTORAGE);
}


// ============================================================
// HISTÓRICO DE CONSULTAS
// ------------------------------------------------------------
// Além de lembrar o ÚLTIMO perfil (RF14), guardamos também um
// registro de QUEM fez cada consulta nesta aba do navegador:
// nome, área, a vaga mais compatível encontrada e quando foi.
// Mesma técnica do RF14 (localStorage + JSON.stringify/parse),
// só que numa lista em vez de um único valor.
// ============================================================

/**
 * Registra uma nova consulta no início do histórico e devolve a
 * lista já atualizada (com no máximo MAXIMO_HISTORICO itens).
 *
 * @param   {object}      perfil        - dados informados no formulário
 * @param   {object|null} melhorVaga    - retorno de encontrarMelhorVaga()
 * @returns {object[]}    histórico atualizado
 */
export function registrarConsulta(perfil, melhorVaga) {
  const historico = obterHistorico();

  const novaEntrada = {
    nome: perfil.nome,
    area: perfil.area,
    melhorVaga: melhorVaga ? melhorVaga.resumo : "nenhuma vaga compatível",
    percentual: melhorVaga ? melhorVaga.percentual : 0,
    dataHora: new Date().toISOString(),
  };

  // unshift: coloca a consulta mais nova no INÍCIO da lista
  historico.unshift(novaEntrada);

  // slice: mantém só os itens mais recentes, descarta o resto
  const historicoLimitado = historico.slice(0, MAXIMO_HISTORICO);

  localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historicoLimitado));
  return historicoLimitado;
}

/**
 * Recupera o histórico de consultas salvo neste navegador, ou
 * uma lista vazia se ainda não houver nenhum registro.
 *
 * @returns {object[]}
 */
export function obterHistorico() {
  const bruto = localStorage.getItem(CHAVE_HISTORICO);

  if (bruto === null) return [];

  try {
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    console.warn("Histórico salvo estava corrompido e foi ignorado.", erro);
    return [];
  }
}

/**
 * Apaga todo o histórico de consultas deste navegador.
 */
export function limparHistorico() {
  localStorage.removeItem(CHAVE_HISTORICO);
}
