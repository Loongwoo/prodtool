const list = document.getElementById('list');
const cancelBtn = document.getElementById('cancelBtn');
const okBtn = document.getElementById('okBtn');

let selectedPid;
const setPortId = id => {
  selectedPid = id;

  okBtn.className = 'btn-ok';
  okBtn.removeAttribute('disabled');
  list.childNodes.forEach((el, i) => {
    el.className = id === el.id ? `list-item selected` : i % 2 ? `list-item odd` : `list-item`;
  });
};

let sender;
window.electronAPI.updateList((event, array) => {
  sender = event.sender;

  array.forEach((port, index) => {
    const { portId, portName } = port;
    const node = document.createElement('div');
    node.className = index % 2 ? `list-item odd` : `list-item`;
    node.innerText = portName;
    node.id = portId;
    node.addEventListener('click', () => setPortId(portId));
    list.appendChild(node);
  });
});

cancelBtn.addEventListener('click', () => {
  if (sender) sender.send('serial-port', undefined);
});

okBtn.addEventListener('click', () => {
  if (sender) sender.send('serial-port', selectedPid);
});
