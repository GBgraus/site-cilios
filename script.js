const API_URL = "https://script.google.com/macros/s/AKfycbwly-PwDT2UqYrga0E0tr5pBM3bybqDsSWJnGWUIxnkgMcFBFp_LqlNtp72Uw5JsvzUzQ/exec";

document.getElementById('agendamentoForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const tipo = document.getElementById('tipo').value;
    const data = document.getElementById('data').value;
    const local = document.getElementById('local').value;

    // valida: apenas dezembro
    const mes = new Date(data + "T00:00:00").getMonth() + 1;
    if (mes !== 12) {
        alert("❗ Agendamentos só podem ser feitos no mês de DEZEMBRO.");
        return;
    }

    // --- ENVIO CORRETO PARA API (GET) ---
    const url = `${API_URL}?tipo=${encodeURIComponent(tipo)}&data=${encodeURIComponent(data)}&local=${encodeURIComponent(local)}`;

    const resposta = await fetch(url);
    const resultado = await resposta.json();

    if (resultado.status === "ocupado") {
        alert("Este dia já está ocupado! Escolha outro.");
        return;
    }
// MENSAGEM do WhatsApp
  const mensagem = 
    `Olá! Gostaria de agendar um procedimento de cílios.%0A%0A` +
    `*Tipo:* ${tipo}%0A` +
    `*Data:* ${data}%0A` +
    `*Local:* ${local}`;

  const numero = "5521986096026";

  // 🔥 ABRE O WHATSAPP IMEDIATAMENTE (para evitar bloqueio)
  window.open(`https://wa.me/${numero}?text=${mensagem}`, '_blank');
});


// salvar no calendário
const addBtn = document.getElementById('addCalendar');
addBtn.addEventListener('click', () => {
    const data = document.getElementById('data').value;
    if(!data) return alert('Escolha uma data primeiro!');

    const mes = new Date(data + "T00:00:00").getMonth() + 1;
    if (mes !== 12) return alert('Agendamentos só em dezembro!');

    const inicio = `${data}T09:00:00`;
    const fim = `${data}T10:00:00`;

    const evento = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Procedimento de Cílios
DTSTART:${inicio.replace(/[-:]/g, '')}
DTEND:${fim.replace(/[-:]/g, '')}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([evento], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'agendamento_cilios.ics';
    a.click();
});
