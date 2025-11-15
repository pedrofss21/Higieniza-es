const form = document.getElementById('form');
const tabela = document.getElementById('tabela').querySelector('tbody');
const mesSelecionado = document.getElementById('mesSelecionado');
const { jsPDF } = window.jspdf;

let registros = JSON.parse(localStorage.getItem('registros')) || [];
let indiceEdicao = null; // novo: guarda qual item está sendo editado

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
      <td>
        <button class="edit-btn" data-index="${index}">✏️</button>
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </td>
    `;
    tabela.appendChild(tr);
       // --- Cálculo da comissão ---
  const totalCarros = filtrados.length;
  const totalComissao = totalCarros * 5;

  document.getElementById('totalCarros').textContent = totalCarros;
  document.getElementById('totalComissao').textContent = totalComissao.toFixed(2);

  });

  // eventos dos botões de excluir
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = e.target.getAttribute('data-index');
      registros.splice(index, 1);
      salvarLocal();
      atualizarTabela(filtroMes);
    });
  });

  // eventos dos botões de editar
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      indiceEdicao = e.target.getAttribute('data-index');
      const registro = registros[indiceEdicao];
      document.getElementById('data').value = registro.data;
      document.getElementById('servico').value = registro.servico;
      document.getElementById('modelo').value = registro.modelo;
      document.getElementById('placa').value = registro.placa;
      form.querySelector('button[type="submit"]').textContent = '💾 Salvar Alterações';
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

  if (indiceEdicao !== null) {
    // modo edição
    registros[indiceEdicao] = novo;
    indiceEdicao = null;
    form.querySelector('button[type="submit"]').textContent = 'Adicionar';
  } else {
    // modo adicionar
    registros.push(novo);
  }

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

  // Tabela
  const colunas = ["Data", "Serviço", "Modelo", "Placa/Chassi"];
  const linhas = dados.map(r => [r.data, r.servico, r.modelo, r.placa]);

  pdf.autoTable({
    startY: 35,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    headStyles: {
      fillColor: [40, 116, 240],
      textColor: 255,
      halign: 'center'
    },
    bodyStyles: { halign: 'center' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 50 }
    }
  });

  // --- Comissões ---
  const totalCarros = dados.length;
  const totalComissao = totalCarros * 5;

  let y = pdf.lastAutoTable.finalY + 10;

  pdf.setFontSize(14);
  pdf.text("Resumo Financeiro", 14, y);
  y += 8;

  pdf.setFontSize(12);
  pdf.text(`Total de carros higienizados: ${totalCarros}`, 14, y);
  y += 7;

  pdf.text(`Comissão por carro: R$ 5,00`, 14, y);
  y += 7;

  pdf.text(`Total em comissões: R$ ${totalComissao.toFixed(2)}`, 14, y);

  pdf.save(`higienizacoes-${mes}.pdf`);
});


document.getElementById('mesSelecionado').addEventListener('change', () => {
  atualizarTabela(mesSelecionado.value);
});

// botão apagar tudo
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
