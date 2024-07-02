// Firebase 초기화는 index.html, signup.html, inventory.html에 포함되어 있습니다.

// 로그인 기능
function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // 로그인 성공
            window.location.href = "inventory.html";
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

    if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // 회원가입 성공
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
function addProduct() {
    var productName = document.getElementById('productName').value;
    var productQuantity = document.getElementById('productQuantity').value;

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

window.onload = function() {
    if (document.getElementById('inventoryList')) {
        loadInventory();
    }
}
