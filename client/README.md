# Diesis

![alt text](https://github.com/abongioanni/progetto-mana/blob/main/src/assets/icons/icon.png "Logo")

Questa applicazione si sviluppa su 4 piattaforme diverse:

| Server        | Client           | Cloud storage  | Database server |
|:-------------:|:----------------:|:--------------:|:---------------:|
| nodeJs        | Angular          | Cloudinary     | mongoDb         |
| express       | socket.io-client |                | Atlas           |
| Heroku        | Firebase         |                |                 |

Il server è interamente sviluppato in nodeJs utilizzando come framework express con autenticazione JWT; si interfaccia a mongoDb come database in host su atlas su un server in Belgio, mentre le immagini sono immagazzinate su un servizio di cloud Cloudinary.

Il client è sviluppato interamente utilizzando il framework Angular, con una grafica che da il suo meglio su mobile, mentre sulla visualizzazione desktop il social mostra una grafica allargata di quella mobile.

Per poter utilizzare l'applicazione ci si deve registrare e bisogna effettuare il login (c'è anche il reset della password dimenticata tramite mail).

Il social gira sul concetto di **post**: un post è una foto caricata da un utente, con una descrizione e dei tag che viene visualizzata dagli utenti che ti seguono, i quali possono mettere like o salvare i post in una sezione apposita.

L'applicazione si struttura in pages:

* Home page: qui vengono visualizzati gli ultimi post dei tuoi seguiti
* Profile: viene visualizzato il proprio profilo con tutti i post
* Settings: dove si possono modificare le impostazioni del profilo
* Saved posts: elenco di tutti i post salvati
* Add post: qui si può caricare una foto, applicarne degli effetti, aggiungere una descrizione e dei tag
* Search: si possono ricercare utenti in base allo username e post in base ai tags
* Messages: elenco delle conversazioni
* Chat: live chat
* Add chat: creazione di una nuova conversazione
* Chat info: info sulla chat ed elenco sui suoi partecipanti

Quando arriva un messaggio e non si è presenti nella chat compare un banner in alto che avvisa del messaggio.

https://progetto-mana.web.app/
https://progetto-mana.herokuapp.com


