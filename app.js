<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>재고 관리</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-firestore.js"></script>
    <script>
        var firebaseConfig = {
            apiKey: "AIzaSyDX0ZBiSt2qp8Q6TDMgvt_pofERgPpA_dc",
            authDomain: "indie-inventory.firebaseapp.com",
            projectId: "indie-inventory",
            storageBucket: "indie-inventory.appspot.com",
            messagingSenderId: "510795992497",
            appId: "1:510795992497:web:544d12465e5678b1660190"
        };
        // Firebase 초기화
        firebase.initializeApp(firebaseConfig);

        function loadInventory(uid) {
            var inventoryList = document.getElementById('inventoryList');
            inventoryList.innerHTML = "";

            firebase.firestore().collection("inventory").where("uid", "==", uid).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var product = doc.data();
                    var productDetails = product.name;
                    if (product.size) {
                        productDetails += " (" + product.size + ")";
                    }
                    productDetails += ": " + product.quantity;
                    inventoryList.innerHTML += "<li>" + productDetails + "</li>";
                });
            }).catch((error) => {
                console.error("Error getting documents:", error);
            });
        }

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
                    if (doc.exists) {
                        document.getElementById('bandName').textContent = doc.data().bandName + ' 님의 재고관리';
                        loadInventory(user.uid);
                    }
                }).catch((error) => {
                    console.error("Error getting document:", error);
                });
            } else {
                window.location.href = "index.html";
            }
        });

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

        function addMultipleSizeItem() {
            var productName = document.getElementById('multipleItemName').value;
            var productSize = document.getElementById('multipleItemSize').value;
            var productQuantity = document.getElementById('multipleItemQuantity').value;

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

        function showAddItemPopup() {
            document.getElementById('addItemPopup').style.display = 'block';
        }

        function hideAddItemPopup() {
            document.getElementById('addItemPopup').style.display = 'none';
            document.getElementById('singleItemForm').classList.add('hidden');
            document.getElementById('multipleSizeItemForm').classList.add('hidden');
        }

        function showSingleItemForm() {
            document.getElementById('singleItemForm').classList.remove('hidden');
            document.getElementById('multipleSizeItemForm').classList.add('hidden');
        }

        function showMultipleSizeItemForm() {
            document.getElementById('singleItemForm').classList.add('hidden');
            document.getElementById('multipleSizeItemForm').classList.remove('hidden');
        }

        function logout() {
            firebase.auth().signOut().then(() => {
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Error signing out:", error);
            });
        }
    </script>
</head>
<body>
    <div class="header">
        <h2 id="bandName"></h2>
    </div>
    <div class="container">
        <ul id="inventoryList"></ul>
        <button class="add-btn" onclick="showAddItemPopup()">상품추가</button>
    </div>

    <div id="addItemPopup" class="popup">
        <div class="popup-content">
            <div id="singleItemForm" class="form hidden">
                <input type="text" id="singleItemName" placeholder="품목 이름">
                <input type="number" id="singleItemQuantity" placeholder="재고 수량">
                <button onclick="addSingleItem()">추가</button>
                <button onclick="hideAddItemPopup()">닫기</button>
            </div>
            <div id="multipleSizeItemForm" class="form hidden">
                <input type="text" id="multipleItemName" placeholder="품목 이름">
                <input type="text" id="multipleItemSize" placeholder="품목 사이즈">
                <input type="number" id="multipleItemQuantity" placeholder="재고 수량">
                <button onclick="addMultipleSizeItem()">추가</button>
                <button onclick="hideAddItemPopup()">닫기</button>
            </div>
        </div>
    </div>
    <div class="footer">
        <button onclick="logout()">로그아웃</button>
    </div>
</body>
</html>

<style>
  .header {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
  }

  .add-btn {
      position: relative;
      display: block;
      margin: 20px auto;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      width: 100px;
      height: 40px;
      font-size: 16px;
      cursor: pointer;
  }

  .popup {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      padding: 20px;
      border-radius: 8px;
      width: 300px;
  }

  .popup-content {
      display: flex;
      flex-direction: column;
  }

  .form {
      margin-top: 20px;
  }

  .form.hidden {
      display: none;
  }

  .footer {
      text-align: center;
      padding: 10px;
      position: fixed;
      bottom: 10px;
      width: 100%;
      background-color: #f8f9fa;
  }

  .footer button {
      font-size: 12px;
      background: none;
      border: none;
      color: blue;
      cursor: pointer;
  }
</style>
