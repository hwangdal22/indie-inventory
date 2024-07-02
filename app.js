// Firebase 초기화는 index.html, signup.html, inventory.html, reset-password.html에 포함되어 있습니다.

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

// 비밀번호 재설정 기능
function resetPassword() {
    var email = document.getElementById('email').value;
    var bandName = document.getElementById('bandName').value;

    firebase.firestore().collection('users').where('email', '==', email).where('bandName', '==', bandName).get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                var resetPasswordFunction = firebase.functions().httpsCallable('resetPassword');
                resetPasswordFunction({ email: email })
                    .then((result) => {
                        alert(result.data.message);
                    })
                    .catch((error) => {
                        console.error("Error resetting password: ", error);
                        alert("비밀번호 재설정 중 오류가 발생했습니다.");
                    });
            } else {
                alert("입력한 정보가 올바르지 않습니다.");
            }
        })
        .catch((error) => {
            console.error("Error fetching user data: ", error);
            alert("사용자 정보를 가져오는 중 오류가 발생했습니다.");
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
