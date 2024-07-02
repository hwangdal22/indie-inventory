// Firebase 초기화는 index.html, signup.html, inventory.html에 포함되어 있습니다.

// 로그인 기능
function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            // 로그인 성공 시 밴드 이름을 불러와서 localStorage에 저장
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
            // 회원가입 성공
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
function loadInventory() {
    var bandName = localStorage.getItem('bandName');
    document.getElementById('bandName').textContent = bandName + ' 님의 재고관리';

    var inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = "";

    firebase.firestore().collection("inventory").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var product = doc.data();
            inventoryList.innerHTML += "<li>" + product.name + ": " + product.quantity + "</li>";
        });
    });
}

// 상품 추가
function addSingleItem() {
    var productName = document.getElementById('singleItemName').value;
    var productQuantity = document.getElementById('singleItemQuantity').value;

    firebase.firestore().collection("inventory").add({
        name: productName,
        quantity: parseInt(productQuantity)
    })
    .then((docRef) => {
        alert("상품이 추가되었습니다!");
        loadInventory();
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

function addMultipleSizeItem() {
    var productName = document.getElementById('multipleItemName').value;
    var productSize = document.getElementById('multipleItemSize').value;
    var productQuantity = document.getElementById('multipleItemQuantity').value;

    firebase.firestore().collection("inventory").add({
        name: productName,
        size: productSize,
        quantity: parseInt(productQuantity)
    })
    .then((docRef) => {
        alert("상품이 추가되었습니다!");
        loadInventory();
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

// 팝업 표시 및 숨기기
function showAddItemPopup() {
    document.getElementById('addItemPopup').style.display = 'block';
}

function hideAddItemPopup() {
    document.getElementById('addItemPopup').style.display = 'none';
}

function showSingleItemForm() {
    document.getElementById('singleItemForm').classList.remove('hidden');
    document.getElementById('multipleSizeItemForm').classList.add('hidden');
}

function showMultipleSizeItemForm() {
    document.getElementById('singleItemForm').classList.add('hidden');
    document.getElementById('multipleSizeItemForm').classList.remove('hidden');
}

window.onload = function() {
    if (document.getElementById('inventoryList')) {
        loadInventory();
    }
}
