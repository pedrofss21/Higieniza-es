const form = document.getElementById('form');
const tabela = document.getElementById('tabela').querySelector('tbody');
const mesSelecionado = document.getElementById('mesSelecionado');
const { jsPDF } = window.jspdf;

let registros = JSON.parse(localStorage.getItem('registros')) || [];
let indiceEdicao = null;

function salvarLocal() {
  localStorage.setItem('registros', JSON.stringify(registros));
}

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
      <td>${r.modelo}</td>
      <td>${r.placa}</td>
      <td>
        <button class="edit-btn" data-index="${indexReal}">✏️</button>
        <button class="delete-btn" data-index="${indexReal}">🗑️</button>
      </td>
    `;
    tabela.appendChild(tr);
  });

  const totalCarros = filtrados.length;
  const totalComissao = totalCarros * 5;
  
  function calcularComissao(servico, tipoVeiculo) {

    if (servico === "Higienização") {
        return 5;
    }

    if (servico === "Polimento") {
        if (tipoVeiculo === "Novo") {
            return 5;
        }

        if (tipoVeiculo === "Semi-novo") {
            return 10;
        }
    }

    return 0;
}

  document.getElementById('totalCarros').textContent = totalCarros;
  document.getElementById('totalComissao').textContent = totalComissao.toFixed(2);

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = e.target.getAttribute('data-index');
      registros.splice(index, 1);
      salvarLocal();
      atualizarTabela(filtroMes);
    });
  });

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
    registros[indiceEdicao] = novo;
    indiceEdicao = null;
    form.querySelector('button[type="submit"]').textContent = 'Adicionar';
  } else {
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

  pdf.setFontSize(18);
  pdf.text(`Higienizações - ${mes}`, 105, 20, { align: 'center' });

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

mesSelecionado.addEventListener('change', () => {
  atualizarTabela(mesSelecionado.value);
});

// Criar botão "Apagar tudo"
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

/* ---------------------------
      MODO ESCURO – CORRIGIDO
----------------------------*/
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

// Inicializar tabela
atualizarTabela();
