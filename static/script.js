let elements = [];

// ジャンプタイプの切り替え
function switchJumpType(type) {
  console.log("switchJumpType:", type);
  const singleDiv = document.getElementById("singleJumpDiv");
  const combinationDiv = document.getElementById("combinationDiv");
  
  if (type === "single") {
    singleDiv.style.display = "block";
    combinationDiv.style.display = "none";
  } else {
    singleDiv.style.display = "none";
    combinationDiv.style.display = "block";
  }
}

function addElement() {
  console.log("=== addElement function started ===");
  
  // ジャンプタイプを確認
  const jumpType = document.querySelector('input[name="jumpType"]:checked').value;
  console.log("jumpType:", jumpType);
  
  if (jumpType === "single") {
    addSingleElement();
  } else {
    addCombinationElement();
  }
}

function addSingleElement() {
  console.log("=== addSingleElement started ===");
  const select = document.getElementById("element");
  console.log("select element:", select);
  
  if (!select) {
    console.error("ERROR: element selectが見つかりません!");
    alert("エラー：要素選択ボックスが見つかりません");
    return;
  }
  
  const option = select.options[select.selectedIndex];
  const value = Number(option.getAttribute("data-base"));
  const name = option.text;
  const goe = Number(document.getElementById("goe").value);
  
  console.log("addElement called", { name, value, goe });
  
  if (!value || value === 0 || isNaN(value)) {
    alert("要素を選択してください");
    return;
  }
  
  // GOE計算：ChSqは1ごとに0.5点、その他は基礎点の-50%～+50%
  let goeValue;
  if (name.includes("ChSq")) {
    goeValue = goe * 0.5;  // ChSqは1ごとに0.5点
  } else {
    goeValue = value * (goe / 10);  // その他は基礎点の±50%
  }

  elements.push({name, base: value, goe: goe, goeValue: goeValue});
  
  // 入力フィールドをクリア
  document.getElementById("goe").value = "0";
  
  renderElements();
}

function addCombinationElement() {
  console.log("=== addCombinationElement started ===");
  
  const comboJump1 = document.getElementById("comboJump1");
  const comboJump2 = document.getElementById("comboJump2");
  const comboJump3 = document.getElementById("comboJump3");
  
  const jump1Option = comboJump1.options[comboJump1.selectedIndex];
  const jump2Option = comboJump2.options[comboJump2.selectedIndex];
  const jump3Option = comboJump3.options[comboJump3.selectedIndex];
  
  // ジャンプ1は必須
  if (!jump1Option || !jump1Option.value) {
    alert("ジャンプ1を選択してください");
    return;
  }
  
  // ジャンプを配列に格納
  const jumps = [];
  jumps.push({
    name: jump1Option.text,
    base: Number(jump1Option.getAttribute("data-base"))
  });
  
  if (jump2Option && jump2Option.value) {
    jumps.push({
      name: jump2Option.text,
      base: Number(jump2Option.getAttribute("data-base"))
    });
  }
  
  if (jump3Option && jump3Option.value) {
    jumps.push({
      name: jump3Option.text,
      base: Number(jump3Option.getAttribute("data-base"))
    });
  }
  
  // 基礎点合計を計算
  const totalBase = jumps.reduce((sum, j) => sum + j.base, 0);
  
  // GOE
  const goe = Number(document.getElementById("goe").value);
  let goeValue;
  
  // コンビネーション：最後のジャンプのGOEを使用
  // 一般的に、コンビネーションのGOEは最後のジャンプに適用される
  if (jumps.length > 0) {
    goeValue = totalBase * (goe / 10);  // 合計基礎点の±50%
  } else {
    goeValue = 0;
  }
  
  const jumpsText = jumps.map(j => j.name).join(" + ");
  
  console.log("Combination:", { jumpsText, totalBase, goe, goeValue });
  
  elements.push({
    name: jumpsText,
    base: totalBase,
    goe: goe,
    goeValue: goeValue,
    isCombo: true,
    jumps: jumps
  });
  
  // 入力フィールドをクリア
  document.getElementById("goe").value = "0";
  comboJump1.value = "";
  comboJump2.value = "";
  comboJump3.value = "";
  
  renderElements();
}

function renderElements() {
  console.log("renderElements called, elements:", elements);
  const list = document.getElementById("elements");
  if (!list) {
    console.error("elements ul not found!");
    return;
  }
  list.innerHTML = "";

  let baseTotal = 0;
  let goeTotal = 0;
  let tesTotal = 0;

  elements.forEach((e, index) => {
    baseTotal += e.base;
    goeTotal += e.goeValue;
    tesTotal += e.base + e.goeValue;

    const li = document.createElement("li");
    const goeDisplay = e.goe >= 0 ? `+${e.goe}` : `${e.goe}`;
    const goePercent = e.goe >= 0 ? `+${e.goe * 10}%` : `${e.goe * 10}%`;
    li.textContent = `${e.name} (${e.base}) GOE${goeDisplay}(${goePercent} = ${e.goeValue.toFixed(2)}) = ${(e.base + e.goeValue).toFixed(2)}`;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.onclick = () => {
      elements.splice(index, 1);
      renderElements();
    };
    deleteBtn.style.marginLeft = "10px";
    
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  // PCS計算：3つの要素を合計してから、ファクターを適用
  const componentsInput = Number(document.getElementById("componentsInput").value) || 0;
  const presentationInput = Number(document.getElementById("presentationInput").value) || 0;
  const skatingSkillsInput = Number(document.getElementById("skatingSkillsInput").value) || 0;
  
  const pcsTotalScore = componentsInput + presentationInput + skatingSkillsInput;
  const factorInput = Number(document.getElementById("factorInput").value) || 1.6;
  const pcsTotal = pcsTotalScore * factorInput;
  const grandTotal = tesTotal + pcsTotal;

  document.getElementById("total").textContent = baseTotal.toFixed(2);
  document.getElementById("goeTotal").textContent = goeTotal.toFixed(2);
  document.getElementById("tesTotal").textContent = tesTotal.toFixed(2);
  document.getElementById("pcsTotalScore").textContent = pcsTotalScore.toFixed(2);
  document.getElementById("pcsTotal").textContent = pcsTotal.toFixed(2);
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}



// 初期化時に保存済みプログラムを読み込み
window.addEventListener("DOMContentLoaded", () => {
  console.log("=== DOMContentLoaded イベント発火 ===");
  
  const elementsList = document.getElementById("elements");
  console.log("elements ul found:", elementsList);
  
  const componentsInput = document.getElementById("componentsInput");
  const presentationInput = document.getElementById("presentationInput");
  const skatingSkillsInput = document.getElementById("skatingSkillsInput");
  const factorInput = document.getElementById("factorInput");
  
  console.log("componentsInput:", componentsInput);
  console.log("presentationInput:", presentationInput);
  console.log("skatingSkillsInput:", skatingSkillsInput);
  console.log("factorInput:", factorInput);
  
  if (componentsInput) {
    componentsInput.addEventListener("input", renderElements);
  }
  if (presentationInput) {
    presentationInput.addEventListener("input", renderElements);
  }
  if (skatingSkillsInput) {
    skatingSkillsInput.addEventListener("input", renderElements);
  }
  if (factorInput) {
    factorInput.addEventListener("input", renderElements);
  }
  
  renderElements();
  console.log("=== 初期化完了 ===");
});