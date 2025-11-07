const form = document.getElementById('form');
const tabela = document.getElementById('tabela').querySelector('tbody');
const mesSelecionado = document.getElementById('mesSelecionado');
const { jsPDF } = window.jspdf;

let registros = JSON.parse(localStorage.getItem('registros')) || [];

function salvarLocal() {
  localStorage.setItem('registros', JSON.stringify(registros));
}

function atualizarTabela(filtroMes = null) {
  tabela.innerHTML = '';

  const filtrados = filtroMes
    ? registros.filter(r => r.data.startsWith(filtroMes))
    : registros;

  filtrados.forEach((r, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.data}</td>
      <td>${r.servico}</td>
      <td>${r.modelo}</td>
      <td>${r.placa}</td>
      <td><button class="delete-btn" data-index="${index}">🗑️</button></td>
    `;
    tabela.appendChild(tr);
  });

  // adiciona evento aos botões de exclusão
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      registros.splice(index, 1);
      salvarLocal();
      atualizarTabela(filtroMes);
    });
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const novo = {
    data: document.getElementById('data').value,
    servico: document.getElementById('servico').value,
    modelo: document.getElementById('modelo').value,
    placa: document.getElementById('placa').value
  };
  registros.push(novo);
  salvarLocal();
  atualizarTabela();
  form.reset();
});

document.getElementById('gerarPDF').addEventListener('click', () => {
  const mes = mesSelecionado.value;
  if (!mes) return alert('Escolha um mês.');

  const dados = registros.filter(r => r.data.startsWith(mes));
  if (dados.length === 0) return alert('Nenhum registro nesse mês.');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Título
  pdf.setFontSize(18);
  pdf.text(`Higienizações - ${mes}`, 105, 20, { align: 'center' });

  // Espaço antes da tabela
  pdf.setFontSize(12);
  pdf.text(`Relatório de serviços do mês ${mes}`, 14, 30);

  // Montar tabela
  const colunas = ["Data", "Serviço", "Modelo", "Placa/Chassi"];
  const linhas = dados.map(r => [r.data, r.servico, r.modelo, r.placa]);

  pdf.autoTable({
    startY: 35,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: {
      fontSize: 11,
      cellPadding: 3,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [40, 116, 240], // azul
      textColor: 255,
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 50 }
    }
  });

  // Rodapé
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  pdf.setFontSize(10);
  pdf.text(`Gerado em ${dataAtual}`, 14, pdf.internal.pageSize.height - 10);

  pdf.save(`higienizacoes-${mes}.pdf`);
});

document.getElementById('mesSelecionado').addEventListener('change', () => {
  atualizarTabela(mesSelecionado.value);
});

// botão para apagar tudo
const btnApagarTudo = document.createElement('button');
btnApagarTudo.textContent = '🧹 Apagar tudo';
btnApagarTudo.className = 'clear-btn';
btnApagarTudo.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja apagar todos os registros?')) {
    registros = [];
    salvarLocal();
    atualizarTabela();
  }
});
document.querySelector('.acoes').appendChild(btnApagarTudo);

atualizarTabela();