// Firebase 초기화는 index.html, signup.html, inventory.html에 포함되어 있습니다.

// 로그인 기능
function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            firebase.firestore().collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        localStorage.setItem('bandName', doc.data().bandName);
                        window.location.href = "inventory.html";
                    }
                });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
}

// 회원가입 기능
function signUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var bandName = document.getElementById('bandName').value;

    if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            return firebase.firestore().collection('users').doc(user.uid).set({
                email: email,
                bandName: bandName
            });
        })
        .then(() => {
            window.location.href = "inventory.html";
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
}

// 재고 목록 로드
function loadInventory(uid) {
    var inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = "";

    firebase.firestore().collection("inventory").where("uid", "==", uid).get().then((querySnapshot) => {
        var inventory = {};
        querySnapshot.forEach((doc) => {
            var product = doc.data();
            if (!inventory[product.name]) {
                inventory[product.name] = [];
            }
            inventory[product.name].push({
                id: doc.id,
                size: product.size || '',
                quantity: product.quantity
            });
        });

        for (var name in inventory) {
            var item = inventory[name];
            var itemHTML = '<li><b>' + name + '</b>';
            item.forEach(product => {
                itemHTML += '<div>' + (product.size ? product.size + ': ' : '') + product.quantity + '</div>';
                itemHTML += '<div class="update-buttons">';
                itemHTML += '<button class="add" onclick="updateQuantity(\'' + product.id + '\', ' + (product.quantity + 1) + ')">+1</button>';
                itemHTML += '<button class="subtract" onclick="updateQuantity(\'' + product.id + '\', ' + (product.quantity - 1) + ')">-1</button>';
                itemHTML += '<button onclick="promptUpdateQuantity(\'' + product.id + '\')">재고수정</button>';
                itemHTML += '</div>';
            });
            itemHTML += '</li>';
            inventoryList.innerHTML += itemHTML;
        }
    }).catch((error) => {
        console.error("Error getting documents:", error);
    });
}

// 상품 추가
function addSingleItem() {
    var productName = document.getElementById('singleItemName').value;
    var productQuantity = document.getElementById('singleItemQuantity').value;

    if (productName === "" || productQuantity === "") {
        alert("모든 필드를 입력해주세요.");
        return;
    }

    var user = firebase.auth().currentUser;

    firebase.firestore().collection("inventory").add({
        uid: user.uid,
        name: productName,
        quantity: parseInt(productQuantity)
    }).then((docRef) => {
        alert("상품이 추가되었습니다!");
        hideAddItemPopup();
        loadInventory(user.uid);
    }).catch((error) => {
        console.error("Error adding document:", error);
    });
}

function addMultipleSizeItem(isClothing) {
    var productName = document.getElementById(isClothing ? 'clothingItemName' : 'otherItemName').value;
    var productSize = document.getElementById(isClothing ? 'clothingItemSize' : 'otherItemSize').value;
    var productQuantity = document.getElementById(isClothing ? 'clothingItemQuantity' : 'otherItemQuantity').value;

    if (productName === "" || productSize === "" || productQuantity === "") {
        alert("모든 필드를 입력해주세요.");
        return;
    }

    var user = firebase.auth().currentUser;

    firebase.firestore().collection("inventory").add({
        uid: user.uid,
        name: productName,
        size: productSize,
        quantity: parseInt(productQuantity)
    }).then((docRef) => {
        alert("상품이 추가되었습니다!");
        hideAddItemPopup();
        loadInventory(user.uid);
    }).catch((error) => {
        console.error("Error adding document:", error);
    });
}

function updateQuantity(docId, newQuantity) {
    firebase.firestore().collection("inventory").doc(docId).update({
        quantity: newQuantity
    }).then(() => {
        firebase.auth().currentUser && loadInventory(firebase.auth().currentUser.uid);
    }).catch((error) => {
        console.error("Error updating document:", error);
    });
}

function promptUpdateQuantity(docId) {
    var newQuantity = prompt("새로운 재고 수량을 입력하세요:");
    if (newQuantity !== null) {
        updateQuantity(docId, parseInt(newQuantity));
    }
}

function showAddItemPopup() {
    document.getElementById('addItemPopup').style.display = 'block';
    document.getElementById('addItemOptions').style.display = 'block';
    document.getElementById('singleItemForm').style.display = 'none';
    document.getElementById('clothingItemForm').style.display = 'none';
    document.getElementById('otherItemForm').style.display = 'none';
}

function hideAddItemPopup() {
    document.getElementById('addItemPopup').style.display = 'none';
}

function showSingleItemForm() {
    document.getElementById('addItemOptions').style.display = 'none';
    document.getElementById('singleItemForm').style.display = 'block';
}

function showClothingItemForm() {
    document.getElementById('addItemOptions').style.display = 'none';
    document.getElementById('clothingItemForm').style.display = 'block';
}

function showOtherItemForm() {
    document.getElementById('addItemOptions').style.display = 'none';
    document.getElementById('otherItemForm').style.display = 'block';
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

window.onload = function() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            loadInventory(user.uid);
        }
    });
}
