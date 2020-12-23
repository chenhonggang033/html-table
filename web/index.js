let rowCounts = 3;
let colCounts = 4;
const hiddenCellArr = [];
const mergeStart = {
  startNode: undefined
};
/**
 * 点击合并按钮
 * @param {*} cellNode 
 */
const handleClickMerge = (cellNode) => {
  if (!mergeStart.startNode) {
    mergeStart.startNode = cellNode
    cellNode.className += "selected"
  } else {
    if (cellNode === mergeStart.startNode) {
      cellNode.className = "";
      mergeStart.startNode = undefined;
    } else {
      const {
        startNode
      } = mergeStart;
      const endNode = cellNode;
      mergeCell(startNode, endNode);
    }
  }
}

/**
 * 合并单元格
 * @param {*} startNode 
 * @param {*} endNode 
 */
const mergeCell = (startNode, endNode) => {
  const minRow = Math.min(startNode.getAttribute("row"),endNode.getAttribute("row"));
  const minCol = Math.min(startNode.getAttribute("col"),endNode.getAttribute("col"));
  const maxRow = Math.max(startNode.getAttribute("row"),endNode.getAttribute("row"));
  const maxCol = Math.max(startNode.getAttribute("col"),endNode.getAttribute("col"));
  const tbodyRef = document.querySelector("tbody");

  const startRow = tbodyRef.childNodes[minRow - 1];
  const mergeNode = startRow.childNodes[minCol];

  for (let i = minRow-1; i < maxRow; i++) {
    for (let j = minCol; j <= maxCol; j++) {
      if (i === minRow-1 && j === minCol) continue;
      else {
        let currentCell = tbodyRef.childNodes[i].childNodes[j];
        currentCell.className = "hidden-cell"
        hiddenCellArr.push(currentCell);
      }
    }
  }
  
  mergeNode.setAttribute("colspan",maxCol - minCol + 1);
  mergeNode.setAttribute("rowspan",maxRow - minRow + 1);

  //增加取消合并按钮
  let buttonWrapper = mergeNode.childNodes[1];
  let cancleMergeButton = document.createElement("button");
  cancleMergeButton.addEventListener('click', () => cancelMergeCell(mergeNode));
  cancleMergeButton.innerHTML = "取消合并";
  buttonWrapper.appendChild(cancleMergeButton);
  mergeNode.className = "";
  //合并状态重置
  mergeStart.startNode = undefined;
}

//取消单元格合并
const cancelMergeCell = (startNode) => {
  console.log(hiddenCellArr);
  startNode.setAttribute("colspan", 1);
  startNode.setAttribute("rowspan", 1);
  hiddenCellArr.forEach((cell) => {
    cell.className = "";
  });
  let buttonWrapper = startNode.childNodes[1];
  buttonWrapper.removeChild(buttonWrapper.childNodes[1]);
}

/**
 * 设置tbody行内第一个单元格,增减行的功能按钮
 * @param {*} cellNode 
 * @param {*} row 
 */
const setFirstCell = (cellNode, row) => {
  cellNode.setAttribute("class", "row-order-num");
  cellNode.innerHTML = row;
  let buttonWrapper = document.createElement("div");
  buttonWrapper.setAttribute("class", "button-wrapper")
  cellNode.appendChild(buttonWrapper);
  let plusButton = document.createElement("button");
  plusButton.addEventListener('click', () => insertTbodyRow(cellNode.parentNode, row));
  plusButton.innerHTML = "+";
  let minusButton = document.createElement("button");
  minusButton.addEventListener('click', () => removeTbodyRow(cellNode.parentNode.nextSibling, row))
  minusButton.innerHTML = "-";
  buttonWrapper.appendChild(plusButton);
  buttonWrapper.appendChild(minusButton);
}

/**
 * 插入列
 * @param {*} cellNode 
 * @param {*} col 
 */
const insertCol = (cellNode, col) => {
  //表头插入Cell --start--
  let TheadRowRef = cellNode.parentNode;
  let referNode = cellNode.nextSibling;
  let newElement = document.createElement("th");
  TheadRowRef.insertBefore(newElement, referNode);
  setTheadCell(newElement, col + 1);
  //表头插入Cell --end--
  //tbody插入Cell --start--
  let tbodyRef = document.querySelector("tbody");
  for (let i = 0; i < tbodyRef.childNodes.length; i++) {
    let trRef = tbodyRef.childNodes[i];
    let newCell = trRef.insertCell(col + 1);
    setInputCell(newCell, i + 1, col + 1, 1, 1, 0)
  }
  //tbody插入Cell --end--
  fixColChange(cellNode.parentNode, col + 2, "insert")
}

/**
 * 删除一列
 * @param {*} cellNode 
 * @param {*} col 
 */
const removeCol = (cellNode, col) => {
  let TheadRowRef = cellNode.parentNode;
  if (TheadRowRef.childNodes.length === 2) {
    alert("表格至少保留一列");
    return;
  }
  TheadRowRef.deleteCell(col);
  let tbodyRef = document.querySelector("tbody");
  for (let i = 0; i < tbodyRef.childNodes.length; i++) {
    let trRef = tbodyRef.childNodes[i];
    trRef.deleteCell(col);
  }
  fixColChange(TheadRowRef, col, "remove")
}

/**
 * 设置表头单元格属性,增减列功能按钮
 * @param {*} cellNode 
 * @param {*} col 
 */
const setTheadCell = (cellNode, col) => {
  let value = col === 0 ? "" : String.fromCharCode(64 + col);
  cellNode.innerHTML = value;
  if (col > 0) {
    let buttonWrapper = document.createElement("div");
    buttonWrapper.setAttribute("class", "button-wrapper")
    cellNode.appendChild(buttonWrapper);
    let plusButton = document.createElement("button");
    plusButton.addEventListener('click', () => insertCol(cellNode, col));
    plusButton.innerHTML = "+";
    let minusButton = document.createElement("button");
    minusButton.addEventListener('click', () => removeCol(cellNode, col))
    minusButton.innerHTML = "-";
    buttonWrapper.appendChild(plusButton);
    buttonWrapper.appendChild(minusButton);
  }
}
/**
 * 列操作后修复坐标
 * @param {*} parentNode 
 * @param {*} fixIndex 
 * @param {*} action 
 */
const fixColChange = (parentNode, fixIndex, action) => {
  let indexTemp = fixIndex;
  for (let i = fixIndex; i < parentNode.childNodes.length; i++) {
    action === "insert" ? setTheadCell(parentNode.childNodes[i], indexTemp) : setTheadCell(parentNode.childNodes[i], indexTemp)
    indexTemp++;
  }
  let tbodyRef = document.querySelector("tbody");
  for (let i = 0; i < tbodyRef.childNodes.length; i++) {
    let tr = tbodyRef.childNodes[i];
    let indexTemp = fixIndex;
    for (let j = fixIndex; j < tr.childNodes.length; j++) {
      action === "insert" ? setInputCell(tr.childNodes[j], i + 1, indexTemp, 1, 1, 0) : setInputCell(tr.childNodes[j], i + 1, indexTemp, 1, 1, 0);
      indexTemp++;
    }
  }
}

/**
 * tbody行操作后修复数据
 * @param {*} nodeRef
 * @param {*} nodeRow 
 * @param {*} action 
 */
const fixRowChange = (nodeRef, nodeRow, action) => {
  if (!nodeRef) return;
  let firsChild = nodeRef.childNodes[0];
  let currentRow = action === "insert" ? nodeRow + 1 : nodeRow;
  setFirstCell(firsChild, currentRow);
  for (let i = 1; i < nodeRef.childNodes.length; i++) {
    let node = nodeRef.childNodes[i];
    node.setAttribute("row", currentRow);
  }
  let nextSibling = nodeRef.nextSibling;
  if (nextSibling) {
    action === "insert" ? fixRowChange(nextSibling, nodeRow + 1, "insert") : fixRowChange(nextSibling, nodeRow + 1, "remove");
  }
}

/**
 * tbody插入一行
 * @param {*} rowNode 
 * @param {*} row 
 */
const insertTbodyRow = (rowNode, row) => {
  let tbodyRef = document.querySelector("tbody");
  let tr = tbodyRef.insertRow(row);
  for (let i = 0; i < rowNode.childNodes.length; i++) {
    let cell = tr.insertCell(i);
    if (i === 0) {
      setFirstCell(cell, row + 1);
    } else {
      setInputCell(cell, row + 1, i, 1, 1, 0);
    }
  }
  //插入行后面的数据需要修复
  fixRowChange(rowNode.nextSibling, row, "insert");
}

/**
 * tbody删除一行
 * @param {*} nextSibling 
 * @param {*} row 
 */
const removeTbodyRow = (nextSibling, row) => {
  let tbodyRef = document.querySelector("tbody");
  if (tbodyRef.childNodes.length === 1) {
    alert("表格至少保留一行")
    return;
  }
  tbodyRef.deleteRow(row - 1);
  //插入行后面的数据需要修复
  fixRowChange(nextSibling, row, "remove");
}

/**
 * 给inputCell添加数据属性
 * @param {*} cellNode 
 * @param {*} row 
 * @param {*} col 
 * @param {*} rowspan 
 * @param {*} colspan 
 * @param {*} value 
 */
const setInputCell = (cellNode, row, col, rowspan, colspan, value) => {
  cellNode.setAttribute("row", row);
  cellNode.setAttribute("col", col);
  cellNode.setAttribute("rowspan", rowspan);
  cellNode.setAttribute("colspan", colspan);
  cellNode.innerHTML = `<input value=${value}>`;
  if (col > 0) {
    let buttonWrapper = document.createElement("div");
    buttonWrapper.setAttribute("class", "merge-button-wrapper")
    cellNode.appendChild(buttonWrapper);
    let mergeButton = document.createElement("button");
    mergeButton.addEventListener('click', () => handleClickMerge(cellNode));
    mergeButton.innerHTML = "合并";
    buttonWrapper.appendChild(mergeButton);
  }
}

window.onload = () => {
  let main = document.querySelector(".demo-wrapper-main");
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");
  for (let i = 0; i < rowCounts; i++) {
    let tr = document.createElement("tr");
    if (i === 0) {
      thead.appendChild(tr);
    } else {
      tbody.appendChild(tr);
    }
    for (let j = 0; j < colCounts; j++) {
      if (i === 0) {
        let cell = document.createElement("th");
        setTheadCell(cell, j)
        tr.appendChild(cell);
      } else {
        let cell = tr.insertCell();
        j === 0 ? setFirstCell(cell, i) : setInputCell(cell, i, j, 1, 1, 0);
      }
    }
  }
  table.appendChild(thead);
  table.appendChild(tbody);
  main.appendChild(table);
}