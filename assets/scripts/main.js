// ============================================================
// MAIN.JS - PONTO DE ENTRADA DA APLICAÇÃO
// ------------------------------------------------------------
// Este é o único arquivo carregado pelo index.html
// (<script type="module" src="./assets/scripts/main.js">).
// Ele importa os outros 3 módulos e orquestra o fluxo:
//
//   1. Ao carregar a página: recupera o perfil salvo (se houver).
//   2. Ao enviar o formulário: busca as vagas, calcula os
//      resultados e manda a UI renderizar tudo.
//
// Nenhuma regra de negócio nem manipulação de DOM mora aqui -
// só a "cola" entre os três módulos.
// ============================================================

import {
  gerarTodosResultados,
  encontrarMelhorVaga,
  gerarRecomendacao,
  criarContadorDeAnalises,
  finalizarAnalise,
} from "./motor.js";

import {
  buscarVagas,
  salvarPerfil,
  carregarPerfil,
  registrarConsulta,
  obterHistorico,
  limparHistorico,
} from "./dados.js";

import {
  obterPerfilDoFormulario,
  preencherFormulario,
  validarPerfil,
  aoEnviarFormulario,
  mostrarCarregando,
  mostrarErro,
  renderizarResultados,
  renderizarMelhorVaga,
  renderizarRecomendacao,
  renderizarContador,
  renderizarHistorico,
  aoClicarLimparHistorico,
  ocultarEstadoInicial,
} from "./ui.js";

// RF08 - closure: cada análise feita nesta aba incrementa o contador
const contarAnalise = criarContadorDeAnalises();

/**
 * Executa uma análise completa: busca vagas, calcula
 * compatibilidade, encontra a melhor vaga e gera a recomendação.
 *
 * @param {object} perfil
 */
async function executarAnalise(perfil) {
  mostrarCarregando();

  try {
    // RF13 - await: espera o fetch resolver antes de continuar
    const vagas = await buscarVagas();

    // RF06 - map (dentro de gerarTodosResultados)
    const resultados = gerarTodosResultados(perfil, vagas);
    const melhorVaga = encontrarMelhorVaga(resultados);

    renderizarResultados(resultados);
    renderizarMelhorVaga(melhorVaga);
    renderizarRecomendacao(gerarRecomendacao(resultados));
    renderizarContador(contarAnalise());

    // RF14 - salva o perfil para a próxima visita
    salvarPerfil(perfil);

    // Histórico: registra quem fez esta consulta e re-renderiza a lista
    const historicoAtualizado = registrarConsulta(perfil, melhorVaga);
    renderizarHistorico(historicoAtualizado);

    // RF08 - callback: quem decide o que acontece "no final" é
    // esta função passada como argumento
    finalizarAnalise(perfil.nome, (nome) => {
      console.log(`${nome}, sua análise foi concluída com sucesso.`);
    });
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

/**
 * Inicializa a aplicação: recupera perfil salvo e liga o
 * listener de envio do formulário.
 */
function iniciar() {
  const perfilSalvo = carregarPerfil();
  if (perfilSalvo) {
    preencherFormulario(perfilSalvo);
  }

  // Mostra o histórico de consultas já salvo neste navegador, se houver
  renderizarHistorico(obterHistorico());

  aoClicarLimparHistorico(() => {
    limparHistorico();
    renderizarHistorico([]);
  });

  aoEnviarFormulario(() => {
    ocultarEstadoInicial();

    const perfil = obterPerfilDoFormulario();
    const erros  = validarPerfil(perfil);

    if (erros.length > 0) {
      mostrarErro(erros.join(" "));
      return;
    }

    executarAnalise(perfil);
  });
}

iniciar();
