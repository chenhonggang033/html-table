const createCellwithAtrr = (tagName, className, row, col, value, display, select) => {
  let cellNode = document.createElement(tagName);
  cellNode.setAttribute("data-row", row);
  cellNode.setAttribute("data-col", col);
  cellNode.setAttribute("data-value", value);
  if (tagName === "th") {
    cellNode.innerHTML = value;
  }
  if (tagName === "td") {
    if (col === 0)
      cellNode.innerHTML = row;
    else
      cellNode.innerHTML = `<input value=0>`;
  }
  cellNode.setAttribute("data-display", display);
  cellNode.setAttribute("data-select", select);
  if (className) {
    cellNode.setAttribute("class", className);
  }
  return cellNode;
}

window.onload = () => {
  let rowCounts = 2;
  let colCounts = 4;
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
        let value = j === 0 ? "" : String.fromCharCode(64 + j);
        let newCell = createCellwithAtrr("th", "", i, j, value, true, false);
        tr.appendChild(newCell);
      } else {
        let newCell = createCellwithAtrr("td", "", i, j, "", true, false);
        tr.appendChild(newCell);
      }
    }
  }
  table.appendChild(thead);
  table.appendChild(tbody);
  main.appendChild(table);
}