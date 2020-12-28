var selectCellArr = [];
var mergeObj = {
  startNode: undefined,
  rowInfo: {
    rowStart:undefined,
    rowEnd:undefined
  },
  colInfo: {
    colStart: undefined,
    colEnd: undefined
  }
};

/**
 * 公共逻辑抽取-设置单元格选中状态
 * @param {*} rowStart 
 * @param {*} rowEnd 
 * @param {*} colStart 
 * @param {*} colEnd 
 */
var setCellStatus = function (rowStart, rowEnd, colStart, colEnd) {
  selectCellArr = [];
  var tbodyRef = document.querySelector("tbody");
  for (var i = rowStart; i <= rowEnd; i++) {
    for (var j = colStart; j <= colEnd; j++) {
      var currentCell = tbodyRef.childNodes[i].childNodes[j];
      if (currentCell.className !== "hidden-cell") {
        currentCell.className = "selected"
        selectCellArr.push(currentCell);
      };
    }
  }
  mergeObj.rowInfo.rowStart = rowStart;
  mergeObj.rowInfo.rowEnd = rowEnd;
  mergeObj.colInfo.colStart = colStart;
  mergeObj.colInfo.colEnd = colEnd;
}


/**
 * 鼠标移到单元格上方时选中要合并的单元格
 * @param {*} cellNode 
 */
var mouseOver = function (cellNode) {
  if (mergeObj.startNode) {
    var startRow = Number(mergeObj.startNode.getAttribute("row"));
    var startCol = Number(mergeObj.startNode.getAttribute("col"));
    var currentRow = Number(cellNode.getAttribute("row"));
    var currentCol = Number(cellNode.getAttribute("col"));

    var rowStart = Math.min(startRow,currentRow) - 1;
    var rowEnd = Math.max(startRow,currentRow) - 1;
    var colStart = Math.min(startCol,currentCol);
    var colEnd = Math.max(startCol,currentCol);

    var nextRowStart = rowStart;
    var nextRowEnd = rowEnd;
    var nextColStart = colStart;
    var nextColEnd = colEnd;

    var tbodyRef = document.querySelector("tbody");

    for(var i = rowStart; i <= rowEnd; i++){
      for(var j = colStart; j <= colEnd; j++){
        var node = tbodyRef.childNodes[i].childNodes[j];
        if(node.getAttribute("merged")) {
          nextRowEnd = Math.max(nextRowEnd, Number(node.getAttribute("row")) + Number(node.getAttribute("rowspan")) - 2);
          nextColEnd = Math.max(nextColEnd, Number(node.getAttribute("col")) + Number(node.getAttribute("colspan")) - 1);
        }
        if(node.className === "hidden-cell") {
          nextRowStart = Math.min(nextRowStart, Number(node.getAttribute("merge-row")));
          nextColStart = Math.min(nextColStart, Number(node.getAttribute("merge-col")));
        }
      }
    }

    selectCellArr.forEach((cell) => {
      if (cell.className === "selected") {
        cell.removeAttribute("class");
      }
    });
    setCellStatus(nextRowStart, nextRowEnd, nextColStart, nextColEnd);
  }
}

/**
 * 点击合并按钮
 * @param {*} cellNode 
 */
var handleClickMerge = function (cellNode) {
  if (!mergeObj.startNode) {
    mergeObj.startNode = cellNode,
    cellNode.className += "selected"
  } else if (cellNode === mergeObj.startNode) {
      cellNode.removeAttribute("class");
      mergeObj.startNode = undefined;
    } else {
      var rowInfo = mergeObj.rowInfo;
      var colInfo = mergeObj.colInfo;
      mergeCell(rowInfo, colInfo);
    }
  
}

/**
 * 合并单元格
 * @param {*} startNode 
 * @param {*} endNode 
 */
var mergeCell = function (rowInfo, colInfo) {
  var tbodyRef = document.querySelector("tbody");
  var startRow = tbodyRef.childNodes[rowInfo.rowStart];
  var mergeNode = startRow.childNodes[colInfo.colStart];

  //如果子单元已合并,则取消合并
  for (var i = rowInfo.rowStart; i <= rowInfo.rowEnd; i++) {
    for (var j = colInfo.colStart; j <= colInfo.colEnd; j++) {
      var currentNode = tbodyRef.childNodes[i].childNodes[j];
      if (currentNode.getAttribute("merged")) {
        cancelMergeCell(currentNode);
      }
    }
  }

  for (var i = rowInfo.rowStart; i <= rowInfo.rowEnd; i++) {
    for (var j = colInfo.colStart; j <= colInfo.colEnd; j++) {
      // JS引擎continue
      if(i === rowInfo.rowStart && j === colInfo.colStart) continue;
        var currentCell = tbodyRef.childNodes[i].childNodes[j];
        currentCell.setAttribute("class","hidden-cell");
        currentCell.setAttribute("merge-row",mergeNode.getAttribute("row"));
        currentCell.setAttribute("merge-col",mergeNode.getAttribute("col"));
    }
  }

  mergeNode.setAttribute("colspan", colInfo.colEnd- colInfo.colStart + 1);
  mergeNode.setAttribute("rowspan", rowInfo.rowEnd - rowInfo.rowStart + 1);

  //增加取消合并按钮
  if (!mergeNode.getAttribute("merged")) {
    var buttonWrapper = mergeNode.childNodes[1];
    var cancleMergeButton = document.createElement("button");
    cancleMergeButton.addEventListener('click', function(){cancelMergeCell(mergeNode)});
    // TODO innerHTML问题
    cancleMergeButton.innerHTML = "取消合并";
    buttonWrapper.appendChild(cancleMergeButton);
    mergeNode.className = "";
    mergeNode.setAttribute("merged", true);
  }
  
  //合并状态重置
  mergeObj.startNode = undefined;
  mergeObj.rowInfo.rowStart = undefined;
  mergeObj.rowInfo.rowEnd = undefined;
  mergeObj.colInfo.colStart = undefined;
  mergeObj.colInfo.colEnd = undefined;
}

//取消单元格合并
var cancelMergeCell = function (startNode) {
  startNode.removeAttribute("merged");
  var tbodyRef = document.querySelector("tbody");
  var row = Number(startNode.getAttribute("row"));
  var rowspan = Number(startNode.getAttribute("rowspan"));
  var col = Number(startNode.getAttribute("col"));
  var colspan = Number(startNode.getAttribute("colspan"));
  for(var i = row-1; i < row + rowspan - 1; i++) {
    for(var j = col; j < col + colspan; j++) {
      // let for循环中的js引擎处理
      tbodyRef.childNodes[i].childNodes[j].removeAttribute("class");
    }
  }
  startNode.setAttribute("colspan", 1);
  startNode.setAttribute("rowspan", 1);
  var buttonWrapper = startNode.childNodes[1];
  buttonWrapper.removeChild(buttonWrapper.childNodes[1]);
}

/**
 * 设置tbody行内第一个单元格,增减行的功能按钮
 * @param {*} cellNode 
 * @param {*} row 
 */
var setFirstCell = function (cellNode, row) {
  cellNode.setAttribute("class", "row-order-num");
  cellNode.innerHTML = row;
  var buttonWrapper = document.createElement("div");
  buttonWrapper.setAttribute("class", "button-wrapper")
  cellNode.appendChild(buttonWrapper);
  var plusButton = document.createElement("button");

  plusButton.addEventListener('click', function(){sertTbodyRow(cellNode.parentNode, row)});
  plusButton.innerHTML = "+";
  var minusButton = document.createElement("button");
  minusButton.addEventListener('click', function(){removeTbodyRow(cellNode.parentNode.nextSibling, row)})
  minusButton.innerHTML = "-";
  buttonWrapper.appendChild(plusButton);
  buttonWrapper.appendChild(minusButton);
}

/**
 * 插入列
 * @param {*} cellNode 
 * @param {*} col 
 */
var insertCol = function (cellNode, col) {
  //表头插入Cell --start--
  // TODO 命名规范
  var TheadRowRef = cellNode.parentNode;
  var referNode = cellNode.nextSibling;
  var newElement = document.createElement("th");
  TheadRowRef.insertBefore(newElement, referNode);
  setTheadCell(newElement, col + 1);
  //表头插入Cell --end--
  //tbody插入Cell --start--
  var tbodyRef = document.querySelector("tbody");
  // 变量比米单字母
  for (var i = 0; i < tbodyRef.childNodes.length; i++) {
    var trRef = tbodyRef.childNodes[i];
    var newCell = trRef.insertCell(col + 1);
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
var removeCol = function (cellNode, col) {
  var TheadRowRef = cellNode.parentNode;
  if (TheadRowRef.childNodes.length === 2) {
    alert("表格至少保留一列");
    return;
  }
  TheadRowRef.devareCell(col);
  var tbodyRef = document.querySelector("tbody");
  for (var i = 0; i < tbodyRef.childNodes.length; i++) {
    var trRef = tbodyRef.childNodes[i];
    trRef.devareCell(col);
  }
  fixColChange(TheadRowRef, col, "remove")
}

/**
 * 设置表头单元格属性,增减列功能按钮
 * @param {*} cellNode 
 * @param {*} col 
 */
var setTheadCell = function (cellNode, col) {
  var value = col === 0 ? "" : String.fromCharCode(64 + col);
  cellNode.innerHTML = value;
  if (col > 0) {
    var buttonWrapper = document.createElement("div");
    buttonWrapper.setAttribute("class", "button-wrapper")
    cellNode.appendChild(buttonWrapper);
    var plusButton = document.createElement("button");
    plusButton.addEventListener('click', function(){insertCol(cellNode, col)});
    plusButton.innerHTML = "+";
    var minusButton = document.createElement("button");
    minusButton.addEventListener('click', function(){removeCol(cellNode, col)})
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
var fixColChange = function (parentNode, fixIndex, action) {
  var indexTemp = fixIndex;
  for (var i = fixIndex; i < parentNode.childNodes.length; i++) {
    action === "insert" ? setTheadCell(parentNode.childNodes[i], indexTemp) : setTheadCell(parentNode.childNodes[i], indexTemp)
    indexTemp++;
  }
  var tbodyRef = document.querySelector("tbody");
  for (var i = 0; i < tbodyRef.childNodes.length; i++) {
    var tr = tbodyRef.childNodes[i];
    var indexTemp = fixIndex;
    for (var j = fixIndex; j < tr.childNodes.length; j++) {
      // 重复逻辑错误
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
var fixRowChange = function (nodeRef, nodeRow, action) {
  if (!nodeRef) return;
  var firsChild = nodeRef.childNodes[0];
  var currentRow = action === "insert" ? nodeRow + 1 : nodeRow;
  setFirstCell(firsChild, currentRow);
  for (var i = 1; i < nodeRef.childNodes.length; i++) {
    var node = nodeRef.childNodes[i];
    node.setAttribute("row", currentRow);
  }
  var nextSibling = nodeRef.nextSibling;
  if (nextSibling) {
    fixRowChange(nextSibling, nodeRow + 1, action);
  }
}

/**
 * tbody插入一行
 * @param {*} rowNode 
 * @param {*} row 
 */
var insertTbodyRow = function (rowNode, row) {
  var tbodyRef = document.querySelector("tbody");
  var tr = tbodyRef.insertRow(row);
  for (var i = 0; i < rowNode.childNodes.length; i++) {
    var cell = tr.insertCell(i);
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
var removeTbodyRow = function (nextSibling, row) {
  var tbodyRef = document.querySelector("tbody");
  if (tbodyRef.childNodes.length === 1) {
    alert("表格至少保留一行")
    return;
  }
  tbodyRef.devareRow(row - 1);
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
var setInputCell = function (cellNode, row, col, rowspan, colspan, value) {
  cellNode.setAttribute("row", row);
  cellNode.setAttribute("col", col);
  cellNode.setAttribute("rowspan", rowspan);
  cellNode.setAttribute("colspan", colspan);
  cellNode.innerHTML = `<input value=${value}>`;
  cellNode.addEventListener('mouseover', function(){mouseOver(cellNode)});
  if (col > 0) {
    var buttonWrapper = document.createElement("div");
    buttonWrapper.setAttribute("class", "merge-button-wrapper")
    cellNode.appendChild(buttonWrapper);
    var mergeButton = document.createElement("button");
    mergeButton.addEventListener('click', function(){handleClickMerge(cellNode)});
    mergeButton.innerHTML = "合并";
    buttonWrapper.appendChild(mergeButton);
  }
}

window.onload = function () {
  var xhr = new XMLHttpRequest();
  var url = '/initTable';
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var resData = JSON.parse(xhr.response);
      var rowCounts = resData.rowCounts;
      var colCounts = resData.colCounts;
      var firstLine =  resData.firstLine;
      console.log(firstLine);
      var main = document.querySelector(".demo-wrapper-main");
      var table = document.createElement("table");
      var thead = document.createElement("thead");
      var tbody = document.createElement("tbody");
      for (var i = 0; i < rowCounts; i++) {
        var tr = document.createElement("tr");
        if (i === 0) {
          thead.appendChild(tr);
        } else {
          tbody.appendChild(tr);
        }
        for (var j = 0; j < colCounts; j++) {
          if (i === 0) {
            var cell = document.createElement("th");
            setTheadCell(cell, j)
            tr.appendChild(cell);
          } else {
            var cell = tr.insertCell();
            if(i === 1) {
              j === 0 ? setFirstCell(cell, i) : setInputCell(cell, i, j, 1, 1, firstLine[j-1].value);
            }
            else {
              j === 0 ? setFirstCell(cell, i) : setInputCell(cell, i, j, 1, 1, 0);
            }
          }
        }
      }
      table.appendChild(thead);
      table.appendChild(tbody);
      main.appendChild(table);
    }
  }
  xhr.open('GET', url, true);
  xhr.send();
}