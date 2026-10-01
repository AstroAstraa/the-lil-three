/* =========================================================
   THE LIL THREE
   Shared ideas + checklists
   ========================================================= */


/* =========================================================
   1. FIREBASE CONFIGURATION
   =========================================================

   IMPORTANT:
   Later, Firebase will give you your own configuration.

   Replace the placeholder values below with YOUR Firebase
   configuration.

   Do not change anything else in this section.
========================================================= */

const firebaseConfig = {

  apiKey: "PASTE_YOUR_API_KEY_HERE",

  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",

  databaseURL: "PASTE_YOUR_DATABASE_URL_HERE",

  projectId: "PASTE_YOUR_PROJECT_ID_HERE",

  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",

  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",

  appId: "PASTE_YOUR_APP_ID_HERE"

};


/* =========================================================
   2. START FIREBASE
========================================================= */

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();


/* =========================================================
   3. THE THREE PEOPLE
========================================================= */

const PEOPLE = [
  "Ongapu",
  "Betku",
  "Bykolu"
];

let currentUser = null;
let currentName = null;


/* =========================================================
   4. ACTIVITY DESIGN

   You can change these later without rebuilding the website.
========================================================= */

const ACTIVITIES = [

  {
    id: "charms",
    icon: "✨",
    title: "Mini Charm Making",
    description: "Tiny things. Huge emotional importance.",
    accent: "#f6cbd8",
    light: "#fff0f5",

    checklist: [
      "Think of charm ideas",
      "Choose designs",
      "Decide materials",
      "Make the charms"
    ]
  },

  {
    id: "bracelets",
    icon: "📿",
    title: "Bracelet Making",
    description: "Matching? Maybe. Chaotic? Definitely.",
    accent: "#dcd4f7",
    light: "#f5f1ff",

    checklist: [
      "Choose bracelet designs",
      "Pick colours",
      "Get beads / thread",
      "Make matching bracelets"
    ]
  },

  {
    id: "painting",
    icon: "🎨",
    title: "Painting",
    description: "Three artists. Questionable results.",
    accent: "#cde8d5",
    light: "#effaf2",

    checklist: [
      "Choose what to paint",
      "Find inspiration",
      "Get supplies",
      "Paint together"
    ]
  },

  {
    id: "movies",
    icon: "🎬",
    title: "Movie Time",
    description: "The hardest part: choosing the movie.",
    accent: "#ffe7a8",
    light: "#fff9e9",

    checklist: [
      "Collect movie ideas",
      "Choose what to watch",
      "Prepare snacks",
      "Movie night!"
    ]
  },

  {
    id: "food",
    icon: "🍰",
    title: "Food & Snacks",
    description: "Because recreation requires fuel.",
    accent: "#f3d0bc",
    light: "#fff4ed",

    checklist: [
      "Collect food ideas",
      "Choose snacks",
      "Try something new"
    ]
  }
];


/* =========================================================
   5. WAIT FOR LOGIN
========================================================= */

auth.onAuthStateChanged(async (user) => {

  if (!user) {

    try {
      await auth.signInAnonymously();
    }

    catch (error) {

      console.error(error);

      showUserMessage(
        "Firebase login isn't ready yet. Check the Firebase setup."
      );
    }

    return;
  }


  currentUser = user;

  askForName();

});


/* =========================================================
   6. ASK WHO IS USING THE WEBSITE
========================================================= */

function askForName() {

  const savedName = localStorage.getItem("lilThreeName");

  if (savedName && PEOPLE.includes(savedName)) {

    currentName = savedName;

    updateWelcome();

    initializeApp();

    return;
  }


  const userArea = document.getElementById("user-area");

  userArea.innerHTML = `

    <div class="name-picker">

      <span>Who's here? 🌷</span>

      <select id="name-select">

        <option value="">Choose your name</option>

        ${PEOPLE.map(person =>
          `<option value="${person}">${person}</option>`
        ).join("")}

      </select>

      <button id="name-save-button">
        Enter
      </button>

    </div>

  `;


  document
    .getElementById("name-save-button")
    .addEventListener("click", saveName);

}


/* =========================================================
   7. SAVE NAME
========================================================= */

function saveName() {

  const selectedName =
    document.getElementById("name-select").value;


  if (!selectedName) {

    alert("Choose one of the three names first 🤡");

    return;
  }


  currentName = selectedName;

  localStorage.setItem(
    "lilThreeName",
    currentName
  );


  updateWelcome();

  initializeApp();

}


/* =========================================================
   8. WELCOME MESSAGE
========================================================= */

function updateWelcome() {

  const userArea =
    document.getElementById("user-area");


  userArea.innerHTML = `

    <span>
      🌷 Hi, ${escapeHtml(currentName)}!
    </span>

    <button
      id="change-name-button"
      style="
        margin-left:10px;
        border:0;
        background:transparent;
        color:#8da0aa;
        font-size:11px;
        font-weight:800;
        cursor:pointer;
      "
    >
      change
    </button>

  `;


  document
    .getElementById("change-name-button")
    .addEventListener("click", () => {

      localStorage.removeItem("lilThreeName");

      location.reload();

    });

}


/* =========================================================
   9. INITIALIZE EVERYTHING
========================================================= */

function initializeApp() {

  renderActivities();

  listenToIdeas();

  listenToRandomIdeas();

}


/* =========================================================
   10. OUR LITTLE IDEAS
========================================================= */

const ideaInput =
  document.getElementById("idea-input");

const addIdeaButton =
  document.getElementById("add-idea-button");


addIdeaButton.addEventListener(
  "click",
  addIdea
);


ideaInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      addIdea();
    }

  }
);


async function addIdea() {

  if (!currentUser || !currentName) return;


  const text =
    ideaInput.value.trim();


  if (!text) return;


  const ideaRef =
    database.ref("ideas").push();


  await ideaRef.set({

    text: text,

    by: currentName,

    uid: currentUser.uid,

    createdAt: firebase.database.ServerValue.TIMESTAMP

  });


  ideaInput.value = "";

}


/* =========================================================
   11. LISTEN TO IDEAS IN REAL TIME
========================================================= */

function listenToIdeas() {

  database
    .ref("ideas")
    .orderByChild("createdAt")
    .on("value", (snapshot) => {

      const list =
        document.getElementById("ideas-list");


      list.innerHTML = "";


      const ideas = [];


      snapshot.forEach((child) => {

        ideas.push({
          id: child.key,
          ...child.val()
        });

      });


      ideas.reverse();


      if (ideas.length === 0) {

        list.innerHTML = `

          <div class="empty-card">
            💭 No ideas yet.
            Be the first little menace.
          </div>

        `;

        return;
      }


      ideas.forEach((idea) => {

        list.appendChild(
          createIdeaElement(idea, "ideas")
        );

      });

    });

}


/* =========================================================
   12. RANDOM IDEAS
========================================================= */

const randomInput =
  document.getElementById("random-input");

const addRandomButton =
  document.getElementById("add-random-button");


addRandomButton.addEventListener(
  "click",
  addRandomIdea
);


randomInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      addRandomIdea();
    }

  }
);


async function addRandomIdea() {

  if (!currentUser || !currentName) return;


  const text =
    randomInput.value.trim();


  if (!text) return;


  const ref =
    database.ref("randomIdeas").push();


  await ref.set({

    text: text,

    by: currentName,

    uid: currentUser.uid,

    createdAt: firebase.database.ServerValue.TIMESTAMP

  });


  randomInput.value = "";

}


function listenToRandomIdeas() {

  database
    .ref("randomIdeas")
    .orderByChild("createdAt")
    .on("value", (snapshot) => {

      const list =
        document.getElementById("random-list");


      list.innerHTML = "";


      const ideas = [];


      snapshot.forEach((child) => {

        ideas.push({

          id: child.key,

          ...child.val()

        });

      });


      ideas.reverse();


      if (ideas.length === 0) {

        list.innerHTML = `

          <div class="empty-card">
            🪩 The nonsense cupboard is empty.
          </div>

        `;

        return;
      }


      ideas.forEach((idea) => {

        list.appendChild(
          createIdeaElement(idea, "randomIdeas")
        );

      });

    });

}


/* =========================================================
   13. CREATE IDEA CARD
========================================================= */

function createIdeaElement(idea, collection) {

  const item =
    document.createElement("div");


  item.className = "idea-item";


  const bullet =
    document.createElement("div");

  bullet.className = "idea-bullet";

  bullet.textContent =
    collection === "randomIdeas"
      ? "🪩"
      : "💡";


  const content =
    document.createElement("div");

  content.className = "idea-text";


  const text =
    document.createElement("div");

  text.textContent =
    idea.text;


  const by =
    document.createElement("div");

  by.className = "idea-by";

  by.textContent =
    `added by ${idea.by || "one of us"}`;


  content.appendChild(text);

  content.appendChild(by);


  const deleteButton =
    document.createElement("button");

  deleteButton.className =
    "delete-button";

  deleteButton.textContent =
    "×";

  deleteButton.title =
    "Delete this idea";


  deleteButton.addEventListener(
    "click",
    async () => {

      const confirmed =
        confirm("Remove this idea?");


      if (!confirmed) return;


      await database
        .ref(`${collection}/${idea.id}`)
        .remove();

    }
  );


  item.appendChild(bullet);

  item.appendChild(content);

  item.appendChild(deleteButton);


  return item;

}


/* =========================================================
   14. RENDER ACTIVITIES
========================================================= */

function renderActivities() {

  const container =
    document.getElementById(
      "activities-container"
    );


  container.innerHTML = "";


  ACTIVITIES.forEach((activity) => {

    const card =
      document.createElement("article");


    card.className =
      "activity-card";


    card.style.setProperty(
      "--card-accent",
      activity.accent
    );


    card.style.setProperty(
      "--card-light",
      activity.light
    );


    card.innerHTML = `

      <div class="activity-header">

        <div class="activity-icon">
          ${activity.icon}
        </div>

        <div>

          <h3>
            ${activity.title}
          </h3>

          <p>
            ${activity.description}
          </p>

        </div>

      </div>


      <div
        class="checklist"
        id="checklist-${activity.id}"
      >
        <div class="loading-card">
          ☁️
        </div>
      </div>


      <div class="add-check-row">

        <input
          id="new-check-${activity.id}"
          type="text"
          maxlength="120"
          placeholder="Add something..."
        >

        <button
          class="small-add"
          data-action="add-check"
          data-id="${activity.id}"
        >
          +
        </button>

      </div>


      <textarea
        class="activity-notes"
        id="notes-${activity.id}"
        placeholder="Little notes, ideas, materials..."
      ></textarea>


      <div class="links-area">

        <div class="links-title">
          🔗 Useful links
        </div>

        <div
          id="links-${activity.id}"
        ></div>


        <div class="add-link-row">

          <input
            id="new-link-${activity.id}"
            type="url"
            placeholder="Paste a link..."
          >

          <button
            data-action="add-link"
            data-id="${activity.id}"
          >
            +
          </button>

        </div>

      </div>

    `;


    container.appendChild(card);


    loadActivity(activity);

  });


  document
    .querySelectorAll('[data-action="add-check"]')
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          addChecklistItem(
            button.dataset.id
          );

        }
      );

    });


  document
    .querySelectorAll('[data-action="add-link"]')
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          addActivityLink(
            button.dataset.id
          );

        }
      );

    });


  document
    .querySelectorAll(".activity-notes")
    .forEach((textarea) => {

      textarea.addEventListener(
        "change",
        () => {

          const activityId =
            textarea.id.replace(
              "notes-",
              ""
            );


          database
            .ref(`activities/${activityId}/notes`)
            .set(textarea.value);

        }
      );

    });

}


/* =========================================================
   15. LOAD ACTIVITY
========================================================= */

function loadActivity(activity) {

  const ref =
    database.ref(
      `activities/${activity.id}`
    );


  ref.on("value", (snapshot) => {

    const data =
      snapshot.val() || {};


    const checklist =
      data.checklist || {};


    const container =
      document.getElementById(
        `checklist-${activity.id}`
      );


    container.innerHTML = "";


    const existingItems = [];


    Object.entries(checklist)
      .forEach(([id, item]) => {

        existingItems.push({

          id,

          ...item

        });

      });


    if (
      existingItems.length === 0 &&
      activity.checklist.length > 0
    ) {

      activity.checklist.forEach(
        (text, index) => {

          existingItems.push({

            id: `default-${index}`,

            text,

            done: false,

            defaultItem: true

          });

        }
      );

    }


    existingItems.forEach((item) => {

      container.appendChild(
        createChecklistItem(
          activity.id,
          item
        )
      );

    });


    const notes =
      document.getElementById(
        `notes-${activity.id}`
      );


    if (
      document.activeElement !== notes
    ) {

      notes.value =
        data.notes || "";

    }


    renderLinks(
      activity.id,
      data.links || {}
    );

  });

}


/* =========================================================
   16. CREATE CHECKLIST ITEM
========================================================= */

function createChecklistItem(
  activityId,
  item
) {

  const row =
    document.createElement("div");


  row.className =
    "check-item";


  if (item.done) {

    row.classList.add("done");

  }


  const checkbox =
    document.createElement("input");


  checkbox.type =
    "checkbox";


  checkbox.checked =
    !!item.done;


  checkbox.addEventListener(
    "change",
    async () => {

      row.classList.toggle(
        "done",
        checkbox.checked
      );


      if (item.defaultItem) {

        const ref =
          database.ref(
            `activities/${activityId}/checklist`
          ).push();


        await ref.set({

          text: item.text,

          done: checkbox.checked

        });

        return;

      }


      await database
        .ref(
          `activities/${activityId}/checklist/${item.id}/done`
        )
        .set(checkbox.checked);

    }
  );


  const label =
    document.createElement("span");


  label.className =
    "check-label";


  label.textContent =
    item.text;


  const remove =
    document.createElement("button");


  remove.className =
    "remove-check";


  remove.textContent =
    "×";


  remove.title =
    "Remove";


  if (item.defaultItem) {

    remove.style.visibility =
      "hidden";

  }


  remove.addEventListener(
    "click",
    async () => {

      await database
        .ref(
          `activities/${activityId}/checklist/${item.id}`
        )
        .remove();

    }
  );


  row.appendChild(checkbox);

  row.appendChild(label);

  row.appendChild(remove);


  return row;

}


/* =========================================================
   17. ADD CHECKLIST ITEM
========================================================= */

async function addChecklistItem(
  activityId
) {

  const input =
    document.getElementById(
      `new-check-${activityId}`
    );


  const text =
    input.value.trim();


  if (!text) return;


  const ref =
    database.ref(
      `activities/${activityId}/checklist`
    ).push();


  await ref.set({

    text: text,

    done: false,

    addedBy: currentName

  });


  input.value = "";

}


/* =========================================================
   18. LINKS
========================================================= */

function renderLinks(
  activityId,
  links
) {

  const container =
    document.getElementById(
      `links-${activityId}`
    );


  container.innerHTML = "";


  Object.entries(links)
    .forEach(([id, link]) => {

      const row =
        document.createElement("div");


      row.className =
        "link-row";


      const anchor =
        document.createElement("a");


      anchor.href =
        link.url;


      anchor.target =
        "_blank";


      anchor.rel =
        "noopener noreferrer";


      anchor.textContent =
        link.label || link.url;


      const remove =
        document.createElement("button");


      remove.className =
        "link-remove";


      remove.textContent =
        "×";


      remove.addEventListener(
        "click",
        async () => {

          await database
            .ref(
              `activities/${activityId}/links/${id}`
            )
            .remove();

        }
      );


      row.appendChild(anchor);

      row.appendChild(remove);

      container.appendChild(row);

    });

}


/* =========================================================
   19. ADD LINK
========================================================= */

async function addActivityLink(
  activityId
) {

  const input =
    document.getElementById(
      `new-link-${activityId}`
    );


  let url =
    input.value.trim();


  if (!url) return;


  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {

    url =
      "https://" + url;

  }


  const label =
    prompt(
      "Give this link a little name:",
      "Inspiration"
    );


  if (label === null) return;


  const ref =
    database.ref(
      `activities/${activityId}/links`
    ).push();


  await ref.set({

    url: url,

    label:
      label.trim() || "Useful link",

    addedBy: currentName

  });


  input.value = "";

}


/* =========================================================
   20. SMALL HELPERS
========================================================= */

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


function showUserMessage(message) {

  const userArea =
    document.getElementById(
      "user-area"
    );


  userArea.textContent =
    message;

}
