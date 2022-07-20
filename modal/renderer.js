const listNode = document.getElementById('list');
const cancelBtn = document.getElementById('cancelBtn');
const connectBtn = document.getElementById('connectBtn');

let selectedPid;
const setPortId = id => {
  selectedPid = id;
  if (id) {
    connectBtn.removeAttribute('disabled');
    listNode.childNodes.forEach((el, i) => {
      el.className = id === el.id ? `list-item selected` : i % 2 ? `list-item odd` : `list-item`;
    });
  } else {
    connectBtn.setAttribute('disabled', true);
    listNode.innerHTML = '';
  }
};

let sender;
window.electronAPI.updateList((event, array) => {
  sender = event.sender;

  listNode.innerHTML = '';

  array.forEach((port, index) => {
    const { portId, portName, displayName } = port;
    const node = document.createElement('div');
    node.className = index % 2 ? `list-item odd` : `list-item`;
    node.innerText = displayName ? `${displayName}(${portName})` : portName;
    node.id = portId;
    node.addEventListener('click', () => setPortId(portId));
    listNode.appendChild(node);
  });
});

const callback = id => {
  if (sender) sender.send('serial-port', id);
  setPortId(undefined);
};

cancelBtn.addEventListener('click', () => callback());
connectBtn.addEventListener('click', () => callback(selectedPid));
