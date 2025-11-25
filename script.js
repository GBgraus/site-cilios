
const form = document.getElementById('agendamentoForm');
const zapLink = document.getElementById('btnZap');  // <a id="btnZap">
const API_URL = "https://script.google.com/macros/s/AKfycbwly-PwDT2UqYrga0E0tr5pBM3bybqDsSWJnGWUIxnkgMcFBFp_LqlNtp72Uw5JsvzUzQ/exec";


form.addEventListener('submit', function(e) {
  e.preventDefault();

  const tipo = document.getElementById('tipo').value;
  const data = document.getElementById('data').value;
  const local = document.getElementById('local').value;

  // valida dezembro
  const mes = new Date(data + "T00:00").getMonth() + 1;
  if (mes !== 12) {
    alert("Agendamentos só podem ser feitos em dezembro.");
    return;
  }

  const mensagem = `Olá! Gostaria de agendar um procedimento de cílios.%0A%0A` +
    `*Tipo:* ${tipo}%0A` +
    `*Data:* ${data}%0A` +
    `*Local:* ${local}`;
  const numero = "5521986096026";

  // Muda o href do <a> para WhatsApp
  zapLink.href = `https://wa.me/${numero}?text=${mensagem}`;

  // Força um clique no link — assim é um clique de verdade
  zapLink.click();

  // Depois também envia para a API
  fetch(API_URL + `?tipo=${encodeURIComponent(tipo)}&data=${encodeURIComponent(data)}&local=${encodeURIComponent(local)}`)
    .then(resp => resp.json())
    .then(ret => {
      if (ret.status === "ocupado") {
        alert("Este dia já está ocupado!");
      } else {
        alert("Agendamento registrado com sucesso!");
      }
    })
    .catch(err => {
      console.error("Erro ao gravar agendamento:", err);
      alert("Houve um problema ao salvar, mas o WhatsApp foi enviado.");
    });
});
