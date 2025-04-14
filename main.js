
// 初始化 Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 匿名登入
let myId = null;
firebase.auth().signInAnonymously().then(res => {
  myId = res.user.uid;
});

// 初始化 Phaser 遊戲
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222',
  physics: { default: 'arcade' },
  scene: { preload, create, update }
};
const game = new Phaser.Game(config);

let players = {};
let myPlayer;

function preload() {
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
  myPlayer = this.physics.add.sprite(400, 300, 'player');
  myPlayer.setCollideWorldBounds(true);

  // 監聽其他玩家
  db.ref("players").on("value", snapshot => {
    const all = snapshot.val() || {};
    Object.keys(all).forEach(id => {
      if (id !== myId) {
        if (!players[id]) {
          players[id] = this.add.sprite(all[id].x, all[id].y, 'player').setTint(0xffaaaa);
        } else {
          players[id].x = all[id].x;
          players[id].y = all[id].y;
        }
      }
    });
  });
}

function update() {
  if (!myId) return;

  const cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    myPlayer.x -= 3;
  } else if (cursors.right.isDown) {
    myPlayer.x += 3;
  }
  if (cursors.up.isDown) {
    myPlayer.y -= 3;
  } else if (cursors.down.isDown) {
    myPlayer.y += 3;
  }

  // 寫入自己位置
  db.ref("players/" + myId).set({
    x: myPlayer.x,
    y: myPlayer.y
  });
}
