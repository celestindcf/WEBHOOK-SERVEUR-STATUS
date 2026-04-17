const axios = require('axios');
const express = require('express');

// ========== CONFIGURATION DES SERVEURS ==========
// AJOUTE TES SERVEURS ICI 👇
const SERVEURS = [
    {
        nom: "NCL",
        ip: "83.150.217.47:7257",  // ex: '51.75.122.200:7777'
        webhook: "https://discord.com/api/webhooks/1494836164685987900/nOjANvIA3NK-YFuYCeLS_77JpbDk2Q81PDVpmfmPYCBSGxdVVRbj3kCowEYqAy9C7mWy"
    }
];

const CHECK_INTERVAL = 60000; // 1 minute
// =============================================

// Serveur web pour Render
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Nova-Life multi-serveurs actif !');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`✅ Serveur web démarré sur le port ${port}`);
});

// ========== FONCTIONS ==========
async function getServerInfo(ip) {
    try {
        const response = await axios.get(`http://${ip}/api/serverinfo`, { timeout: 5000 });
        return response.data;
    } catch (error) {
        console.log(`❌ Serveur ${ip} injoignable :`, error.message);
        return null;
    }
}

function formatEmbed(serveurNom, data) {
    if (!data) {
        return {
            title: `🔴 ${serveurNom} - Hors Ligne`,
            description: 'Impossible de contacter le serveur.',
            color: 0xFF0000,
            timestamp: new Date().toISOString()
        };
    }

    const players = data.players || [];
    const staffs = data.staffs || [];
    const totalMoney = data.totalMoney || 0;
    const maxPlayers = data.maxPlayers || 32;

    return {
        title: `📊 ${serveurNom}`,
        fields: [
            { name: '🟢 Statut', value: 'En ligne', inline: true },
            { name: '👥 Joueurs', value: `${players.length} / ${maxPlayers}`, inline: true },
            { name: '🛡️ Staffs', value: `${staffs.length}`, inline: true },
            { name: '💰 Argent en circulation', value: `${totalMoney.toLocaleString()} $`, inline: false }
        ],
        footer: { text: `Mise à jour automatique` },
        color: 0x00FF00,
        timestamp: new Date().toISOString()
    };
}

async function updateAllServeurs() {
    console.log(`\n🔍 Vérification de ${SERVEURS.length} serveur(s)...`);
    
    for (const serveur of SERVEURS) {
        console.log(`📡 Check: ${serveur.nom} (${serveur.ip})`);
        
        const data = await getServerInfo(serveur.ip);
        const embed = formatEmbed(serveur.nom, data);

        try {
            await axios.post(serveur.webhook, { embeds: [embed] });
            console.log(`✅ ${serveur.nom} -> envoyé sur Discord`);
        } catch (error) {
            console.log(`❌ ${serveur.nom} -> erreur webhook :`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// ========== LANCEMENT ==========
console.log('🚀 Bot de surveillance multi-serveurs Nova-Life démarré');
updateAllServeurs();
setInterval(updateAllServeurs, CHECK_INTERVAL);
