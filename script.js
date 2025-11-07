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

  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text(`Higienizações - ${mes}`, 10, 15);
  pdf.setFontSize(12);

  let y = 25;
  pdf.text('DATA     SERVIÇO          MODELO        PLACA/CHASSI', 10, y);
  y += 8;

  dados.forEach(r => {
    pdf.text(`${r.data}   ${r.servico}   ${r.modelo}   ${r.placa}`, 10, y);
    y += 8;
  });

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