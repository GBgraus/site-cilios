
const form = document.getElementById('agendamentoForm');
const zapLink = document.getElementById('btnZap');  // <a id="btnZap">
const addCalendarBtn = document.getElementById('addCalendar');
const API_URL = "https://script.google.com/macros/s/AKfycbwly-PwDT2UqYrga0E0tr5pBM3bybqDsSWJnGWUIxnkgMcFBFp_LqlNtp72Uw5JsvzUzQ/exec";

function formatDateForICS(dateStr) {
  // dateStr is YYYY-MM-DD -> return YYYYMMDD
  return dateStr.replace(/-/g, '');
}

function makeUID() {
  return `${Date.now()}-${Math.floor(Math.random()*10000)}@lehlash.local`;
}

function buildICS({tipo, data, local}) {
  const dt = formatDateForICS(data);
  const uid = makeUID();
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // All-day event using VALUE=DATE
  const summary = `Agendamento - ${tipo}`;
  const description = `Tipo: ${tipo}\\nLocal: ${local}\\nData: ${data}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leh Lash Design//Agendamento//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return ics;
}

function downloadICS(icsContent, filename) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
        // gera e baixa o .ics automaticamente para o usuário
        try {
          const ics = buildICS({ tipo, data, local });
          const filename = `agendamento-${data}.ics`;
          downloadICS(ics, filename);
        } catch (err) {
          console.error('Erro ao gerar calendário:', err);
        }
      }
    })
    .catch(err => {
      console.error("Erro ao gravar agendamento:", err);
      alert("Houve um problema ao salvar, mas o WhatsApp foi enviado.");
    });
})

// Permite salvar manualmente no calendário sem submeter (botão dentro do form)
if (addCalendarBtn) {
  addCalendarBtn.addEventListener('click', () => {
    const tipo = document.getElementById('tipo').value;
    const data = document.getElementById('data').value;
    const local = document.getElementById('local').value;

    if (!data) {
      alert('Por favor escolha uma data antes de salvar no calendário.');
      return;
    }

    // valida dezembro também aqui
    const mes = new Date(data + 'T00:00').getMonth() + 1;
    if (mes !== 12) {
      if (!confirm('A data escolhida não está em dezembro. Deseja mesmo salvar no calendário?')) return;
    }

    try {
      const ics = buildICS({ tipo, data, local });
      const filename = `agendamento-${data}.ics`;
      downloadICS(ics, filename);
    } catch (err) {
      console.error('Erro ao gerar calendário manual:', err);
      alert('Não foi possível gerar o arquivo de calendário.');
    }
  });
}