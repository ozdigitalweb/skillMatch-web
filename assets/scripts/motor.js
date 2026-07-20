// ============================================================
// MOTOR.JS - REGRAS DE NEGÓCIO DO SKILLMATCH WEB
// ------------------------------------------------------------
// Este módulo concentra tudo que é "regra do jogo": as classes
// Vaga/VagaFrontEnd, o cálculo de compatibilidade, a
// classificação, a busca da melhor vaga, a recomendação de
// estudo e os utilitários de callback/closure.
//
// Ele NÃO toca no DOM e NÃO faz fetch - isso fica para
// ui.js e dados.js. Essa separação é o que o requisito RF15
// (organização em módulos ES) pede: dados x regras x tela.
//
// Este arquivo é a evolução direta do "skillmatch.js" (mini
// projeto do Módulo 01), que rodava só no console. As mesmas
// regras validadas lá foram reaproveitadas aqui, com uma
// mudança importante: o cálculo de compatibilidade virou
// MÉTODO da classe Vaga (RF07), em vez de função solta.
// ============================================================


// ============================================================
// RF07 - CLASSE VAGA
// ============================================================

/**
 * Classe base que representa uma vaga de emprego.
 *
 * CLASSE: molde para criar objetos "Vaga".
 * CONSTRUCTOR: roda automaticamente quando usamos "new Vaga(...)".
 * THIS: dentro da classe, "this" aponta para o objeto que está
 * sendo criado/usado no momento.
// RF09/RF10 (herança): VagaFrontEnd é uma especialização de Vaga.
// Toda VagaFrontEnd "é uma" Vaga, mas com o campo extra "nivel".
 */
export class Vaga {
  /**
   * @param {number}   id
   * @param {string}   empresa
   * @param {string}   cargo
   * @param {string[]} requisitos
   * @param {number}   salario
   * @param {string}   modalidade
   */
  constructor(id, empresa, cargo, requisitos, salario, modalidade) {
    this.id         = id;
    this.empresa    = empresa;
    this.cargo      = cargo;
    this.requisitos = requisitos;
    this.salario    = salario;
    this.modalidade = modalidade;
  }

  /**
   * Retorna um resumo curto da vaga (usa "this").
   * @returns {string}
   */
  exibirResumo() {
    return `${this.cargo} na ${this.empresa}`;
  }

  /**
   * RF07 - Calcula a compatibilidade desta vaga com um perfil de
   * candidato. Este é o método citado no requisito RF07: em vez
   * de uma função solta que recebe a vaga, a própria vaga sabe
   * calcular sua compatibilidade ("this.requisitos").
   *
   * @param   {object} perfil - objeto no formato de PERFIL (ver RF01)
   * @returns {object} resultado detalhado da análise
   */
  calcularCompatibilidade(perfil) {
    // filter: requisitos que o candidato JÁ TEM
    const encontradas = this.requisitos.filter((req) =>
      perfil.habilidades.includes(req)
    );

    // filter: requisitos que o candidato AINDA NÃO TEM
    const faltantes = this.requisitos.filter(
      (req) => !perfil.habilidades.includes(req)
    );

    // every: true somente se TODOS os requisitos forem atendidos
    const atendeTudo = this.requisitos.every((req) =>
      perfil.habilidades.includes(req)
    );

    // percentual = requisitos atendidos / total * 100
    const percentual = Math.round(
      (encontradas.length / this.requisitos.length) * 100
    );

    return {
      vagaId:     this.id,
      empresa:    this.empresa,
      cargo:      this.cargo,
      resumo:     this.exibirResumo(),
      salario:    this.salario,
      modalidade: this.modalidade,
      percentual,
      encontradas,
      faltantes,
      atendeTudo,
      classificacao: classificarCompatibilidade(percentual),
    };
  }
}


// ============================================================
// HERANÇA: VagaFrontEnd extends Vaga
// ============================================================

/**
 * Classe filha que herda de Vaga e acrescenta o campo "nivel"
 * (ex.: Júnior, Estágio, Trainee).
 *
 * HERANÇA: "extends" declara que VagaFrontEnd é uma Vaga, com
 * tudo que Vaga já tem, mais o que for adicionado aqui.
 * "super(...)" chama o constructor da classe pai.
 */
export class VagaFrontEnd extends Vaga {
  /**
   * @param {number}   id
   * @param {string}   empresa
   * @param {string}   cargo
   * @param {string[]} requisitos
   * @param {number}   salario
   * @param {string}   modalidade
   * @param {string}   nivel
   */
  constructor(id, empresa, cargo, requisitos, salario, modalidade, nivel) {
    super(id, empresa, cargo, requisitos, salario, modalidade);
    this.nivel = nivel;
  }

  /** @returns {string} */
  exibirNivel() {
    return `Nível: ${this.nivel}`;
  }

  // Sobrescreve exibirResumo() para incluir o nível (polimorfismo
  // simples: mesma assinatura, comportamento mais completo).
  exibirResumo() {
    return `${this.cargo} (${this.nivel}) na ${this.empresa}`;
  }
}


// ============================================================
// RF04 - CLASSIFICAR A COMPATIBILIDADE
// ============================================================

/**
 * Classifica um percentual em Alta, Média ou Baixa compatibilidade.
 *
 * IF/ELSE: avalia de cima para baixo e para na primeira condição
 * verdadeira.
 *
 * Tabela:
 *   80% a 100% -> Alta compatibilidade
 *   50% a 79%  -> Média compatibilidade
 *    0% a 49%  -> Baixa compatibilidade
 *
 * @param   {number} percentual
 * @returns {string}
 */
export function classificarCompatibilidade(percentual) {
  if (percentual >= 80) return "Alta compatibilidade";
  else if (percentual >= 50) return "Média compatibilidade";
  else return "Baixa compatibilidade";
}


// ============================================================
// RF06 - ENCONTRAR A VAGA COM MAIOR COMPATIBILIDADE
// ============================================================

/**
 * Retorna o resultado com o maior percentual de compatibilidade.
 *
 * reduce: percorre o array acumulando um único valor (o "melhor
 * até agora").
 * Operador ternário: condição ? valor_se_true : valor_se_false
 *
 * @param   {object[]} resultados
 * @returns {object|null}
 */
export function encontrarMelhorVaga(resultados) {
  if (resultados.length === 0) return null;

  return resultados.reduce((melhor, atual) =>
    atual.percentual > melhor.percentual ? atual : melhor
  );
}


// ============================================================
// RF05 - GERAR RECOMENDAÇÃO DE ESTUDO
// ============================================================

/**
 * Junta todas as habilidades faltantes de todas as vagas, remove
 * duplicadas e monta uma recomendação de estudo.
 *
 * reduce: junta todos os arrays de "faltantes" em um só.
 * filter: remove duplicadas comparando a posição com indexOf.
 *
 * @param   {object[]} resultados
 * @returns {string}
 */
export function gerarRecomendacao(resultados) {
  const todas  = resultados.reduce((acc, r) => acc.concat(r.faltantes), []);
  const unicas = todas.filter((h, i) => todas.indexOf(h) === i);

  if (unicas.length === 0) {
    return "Parabéns! Seu perfil atende todos os requisitos das vagas analisadas.";
  }

  return `Priorize estudar: ${unicas.join(", ")}. Esses conteúdos aparecem nas vagas analisadas.`;
}


// ============================================================
// RF06 - MÉTODOS DE ARRAY (map, além do filter/every/reduce já
// usados dentro de calcularCompatibilidade)
// ============================================================

/**
 * Gera os resultados de compatibilidade para TODAS as vagas,
 * usando map para transformar cada vaga em seu resultado.
 *
 * @param   {object}         perfil
 * @param   {VagaFrontEnd[]} vagas
 * @returns {object[]}
 */
export function gerarTodosResultados(perfil, vagas) {
  return vagas.map((vaga) => vaga.calcularCompatibilidade(perfil));
}


// ============================================================
// RF08 - CALLBACK
// ============================================================

/**
 * Executa uma ação de encerramento da análise, delegando o que
 * fazer para uma função recebida por parâmetro (callback).
 *
 * CALLBACK: função passada como argumento para outra função.
 * Quem chama "finalizarAnalise" decide o que acontece ao final.
 *
 * @param {string}   nomeCandidato
 * @param {function} callback
 */
export function finalizarAnalise(nomeCandidato, callback) {
  callback(nomeCandidato);
}


// ============================================================
// RF08 - CLOSURE
// ============================================================

/**
 * Cria um contador de análises usando CLOSURE: a variável
 * "total" fica "presa" dentro da função retornada e só pode ser
 * alterada por ela - ninguém de fora acessa "total" diretamente.
 *
 * @returns {function(): number}
 */
export function criarContadorDeAnalises() {
  let total = 0;
  return function contar() {
    total++;
    return total;
  };
}
