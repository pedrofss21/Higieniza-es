const form = document.getElementById('form');
const tabela = document.getElementById('tabela').querySelector('tbody');
const mesSelecionado = document.getElementById('mesSelecionado');
const { jsPDF } = window.jspdf;

let registros = JSON.parse(localStorage.getItem('registros')) || [];
let indiceEdicao = null;

/* ================================
   REGRA DE COMISSÃO
================================ */

function calcularComissao(servico, tipoVeiculo) {

  // Higienização
  if (servico === "Higienização") {
    return 10;
  }

  // Polimento
  if (servico === "Polimento") {

    if (tipoVeiculo === "Novo") {
      return 10;
    }

    if (tipoVeiculo === "Semi-novo") {
      return 10;
    }

  }

  return 0;
}

/* ================================
   CONTROLE DOS BOTÕES
================================ */

const botoesServico = document.querySelectorAll('.btn-servico');
const botoesTipo = document.querySelectorAll('.btn-tipo');

const campoServico = document.getElementById('servico');
const campoTipo = document.getElementById('tipoVeiculo');
const previewComissao = document.getElementById('previewComissao');

let servicoSelecionado = null;
let tipoSelecionado = null;

botoesServico.forEach(btn => {
  btn.addEventListener('click', () => {

    botoesServico.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');

    servicoSelecionado = btn.dataset.servico;
    campoServico.value = servicoSelecionado;

    atualizarPreview();
  });
});

botoesTipo.forEach(btn => {
  btn.addEventListener('click', () => {

    botoesTipo.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');

    tipoSelecionado = btn.dataset.tipo;
    campoTipo.value = tipoSelecionado;

    atualizarPreview();
  });
});

function atualizarPreview() {

  if (!servicoSelecionado || !tipoSelecionado) {
    previewComissao.textContent = "Comissão: R$ 0,00";
    return;
  }

  const valor = calcularComissao(servicoSelecionado, tipoSelecionado);
  previewComissao.textContent = `Comissão: R$ ${valor.toFixed(2)}`;
}

/* ================================
   SALVAR LOCAL
================================ */

function salvarLocal() {
  localStorage.setItem('registros', JSON.stringify(registros));
}

/* ================================
   ATUALIZAR TABELA
================================ */

function atualizarTabela(filtroMes = null) {

  tabela.innerHTML = '';

  const filtrados = filtroMes
    ? registros.filter(r => r.data.startsWith(filtroMes))
    : registros;

  filtrados.forEach((r) => {

    const indexReal = registros.indexOf(r);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.data}</td>
      <td>${r.servico}</td>
      <td>${r.tipoVeiculo}</td>
      <td>${r.placa}</td>
      <td>R$ ${(r.comissao || 5).toFixed(2)}</td>
      <td>
        <button class="edit-btn" data-index="${indexReal}">✏️</button>
        <button class="delete-btn" data-index="${indexReal}">🗑️</button>
      </td>
    `;
    tabela.appendChild(tr);
  });

  const totalCarros = filtrados.length;

  let totalComissao = 0;
  filtrados.forEach(r => {
    totalComissao += r.comissao || 5;
  });

  document.getElementById('totalCarros').textContent = totalCarros;
  document.getElementById('totalComissao').textContent = totalComissao.toFixed(2);

  /* DELETE */
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = e.target.getAttribute('data-index');
      registros.splice(index, 1);
      salvarLocal();
      atualizarTabela(filtroMes);
    });
  });

  /* EDITAR */
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {

      indiceEdicao = e.target.getAttribute('data-index');
      const registro = registros[indiceEdicao];

      document.getElementById('data').value = registro.data;
      document.getElementById('placa').value = registro.placa;

      servicoSelecionado = registro.servico;
      tipoSelecionado = registro.tipoVeiculo;

      campoServico.value = servicoSelecionado;
      campoTipo.value = tipoSelecionado;

      botoesServico.forEach(b => {
        b.classList.toggle('ativo', b.dataset.servico === servicoSelecionado);
      });

      botoesTipo.forEach(b => {
        b.classList.toggle('ativo', b.dataset.tipo === tipoSelecionado);
      });

      atualizarPreview();

      form.querySelector('button[type="submit"]').textContent = '💾 Salvar Alterações';
    });
  });
}

/* ================================
   ADICIONAR / EDITAR
================================ */

form.addEventListener('submit', e => {

  e.preventDefault();

  const data = document.getElementById('data').value;
  const placa = document.getElementById('placa').value;

  if (!servicoSelecionado || !tipoSelecionado) {
    alert("Selecione o serviço e o tipo do veículo.");
    return;
  }

  const comissao = calcularComissao(servicoSelecionado, tipoSelecionado);

  const novo = {
    data,
    servico: servicoSelecionado,
    tipoVeiculo: tipoSelecionado,
    placa,
    comissao
  };

  if (indiceEdicao !== null) {
    registros[indiceEdicao] = novo;
    indiceEdicao = null;
    form.querySelector('button[type="submit"]').textContent = 'Adicionar';
  } else {
    registros.push(novo);
  }

  salvarLocal();
  atualizarTabela(mesSelecionado.value);
  form.reset();

  servicoSelecionado = null;
  tipoSelecionado = null;
  campoServico.value = '';
  campoTipo.value = '';

  botoesServico.forEach(b => b.classList.remove('ativo'));
  botoesTipo.forEach(b => b.classList.remove('ativo'));

  previewComissao.textContent = "Comissão: R$ 0,00";
});

/* ================================
   GERAR PDF
================================ */

document.getElementById('gerarPDF').addEventListener('click', () => {

  const mes = mesSelecionado.value;
  if (!mes) return alert('Escolha um mês.');

  const dados = registros.filter(r => r.data.startsWith(mes));
  if (dados.length === 0) return alert('Nenhum registro nesse mês.');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  pdf.setFontSize(18);
  pdf.text(`Relatório - ${mes}`, 105, 20, { align: 'center' });

  const colunas = ["Data", "Serviço", "Tipo", "Placa/Chassi", "Comissão"];
  const linhas = dados.map(r => [
    r.data,
    r.servico,
    r.tipoVeiculo,
    r.placa,
    `R$ ${(r.comissao || 5).toFixed(2)}`
  ]);

  pdf.autoTable({
    startY: 35,
    head: [colunas],
    body: linhas,
    theme: 'grid'
  });

  let totalComissao = 0;
  dados.forEach(r => {
    totalComissao += r.comissao || 5;
  });

  const totalCarros = dados.length;

  let y = pdf.lastAutoTable.finalY + 10;

  pdf.setFontSize(12);
  pdf.text(`Total de carros: ${totalCarros}`, 14, y);
  y += 7;
  pdf.text(`Total em comissões: R$ ${totalComissao.toFixed(2)}`, 14, y);

  pdf.save(`relatorio-${mes}.pdf`);
});

/* FILTRO */
mesSelecionado.addEventListener('change', () => {
  atualizarTabela(mesSelecionado.value);
});

/* MODO ESCURO */
const toggleTheme = document.getElementById("toggleTheme");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggleTheme.textContent = "☀️ Modo Claro";
}

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    toggleTheme.textContent = "☀️ Modo Claro";
  } else {
    localStorage.setItem("theme", "light");
    toggleTheme.textContent = "🌙 Modo Escuro";
  }
});

/* INICIALIZAÇÃO */
atualizarTabela();