# Sistema de Registro de Higienizações 🚗✨

Este projeto é um sistema simples e eficiente para registrar higienizações e serviços automotivos, permitindo controle mensal, exportação em PDF, cálculo automático de comissões e salvamento local.  
Ele foi desenvolvido utilizando **HTML, CSS e JavaScript puro**, funcionando 100% no navegador — tanto no PC quanto no celular.

## 📌 Funcionalidades

### ✔ Cadastro de veículos
- Data do serviço  
- Tipo de serviço  
- Modelo (Novo / Seminovo)  
- Placa ou Chassi  

### ✔ Gerenciamento dos registros
- Editar informações de qualquer veículo  
- Excluir veículos individualmente  
- Limpar todos os registros de uma vez  
- Salvamento automático em `localStorage` (não perde ao fechar o navegador)

### ✔ Exportação em PDF
Geração de PDF completo contendo:
- Tabela com todos os veículos do mês selecionado  
- Dados estruturados em colunas  
- Resumo financeiro com:
  - Total de carros
  - Comissão por carro
  - Total de comissões calculado automaticamente  

PDF gerado usando **jsPDF + AutoTable**.

### ✔ Painel de resumo
- Total de carros cadastrados  
- Total de comissões acumuladas  
- Atualização em tempo real conforme adiciona, edita ou exclui  

---

## 🛠️ Tecnologias utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **jsPDF**
- **jsPDF-AutoTable**
- 100% compatível com **GitHub Pages**

---

## 📱 Responsividade

O sistema é totalmente responsivo e pode ser usado em:
- Smartphones  
- Tablets  
- Notebooks  
- Computadores de mesa  

Ideal para uso no dia a dia diretamente do celular.

---

## 🚀 Como usar no GitHub Pages

1. Faça upload dos arquivos no seu repositório:  
   - `index.html`  
   - `style.css`  
   - `script.js`  

2. No GitHub, vá em:
   - **Settings → Pages**
   - Selecione a branch `main`
   - Selecione a pasta `/root`
   - Clique em **Save**

3. Seu site ficará disponível em um link como:
