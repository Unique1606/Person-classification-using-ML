/*Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop or click to upload an image",
        autoProcessQueue: false
    });

    dz.on("addedfile", function(file) {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }

        // Live preview
        let reader = new FileReader();
        reader.onload = function(e) {
            $("#preview").html(`<img src="${e.target.result}" alt="Preview">`);
        };
        reader.readAsDataURL(file);
    });

    dz.on("complete", function(file) {
        let imageData = file.dataURL;

        var url = "http://127.0.0.1:5000/classify_image";

        $("#loading").show();
        $("#error").hide();
        $("#resultHolder").hide();
        $("#divClassTable").hide();

        $.post(url, { image_data: imageData }, function(data, status) {
            $("#loading").hide();

            if (!data || data.length == 0) {
                $("#error").show();
                return;
            }

            let players = Object.keys(data[0].class_dictionary);
            let match = null;
            let bestScore = -1;

            for (let i = 0; i < data.length; ++i) {
                let maxScore = Math.max(...data[i].class_probability);
                if (maxScore > bestScore) {
                    match = data[i];
                    bestScore = maxScore;
                }
            }

            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();

                // Show predicted card
                $("#resultHolder").html(`
                    <div class="card shadow-sm p-3">
                        <h5 class="text-center">Predicted: <b>${match.class}</b></h5>
                        <p class="text-center text-muted">Highest Probability: ${bestScore.toFixed(2)}%</p>
                    </div>
                `);

                // Fill probability table with progress bars
                let classDict = match.class_dictionary;
                for (let person in classDict) {
                    let idx = classDict[person];
                    let prob = match.class_probability[idx];
                    let bar = `
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${prob}%" 
                                aria-valuenow="${prob}" aria-valuemin="0" aria-valuemax="100">
                                ${prob.toFixed(2)}%
                            </div>
                        </div>`;
                    $("#score_" + person).html(bar);
                }
            }
        });
    });

    $("#submitBtn").on('click', function(e) {
        dz.processQueue();
    });

    $("#resetBtn").on('click', function() {
        dz.removeAllFiles(true);
        $("#preview").html("");
        $("#resultHolder").hide();
        $("#divClassTable").hide();
        $("#error").hide();
    });
}

$(document).ready(function() {
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    $("#loading").hide();

    init();
});*/

// app.js — futuristic frontend for classifier
// Make sure your Flask server is running at the URL below:
/*const SERVER_URL = "http://127.0.0.1:5000/classify_image";

let uploadedDataURL = null;
let lastResult = null;

function bytesToKb(b) { return (b / 1024).toFixed(1) + ' KB'; }

function setServerStatus(text, ok) {
  const el = document.getElementById('serverStatus');
  el.textContent = text;
  el.style.color = ok ? '#9ff' : '#ff9';
}

async function pingServer() {
  try {
    const res = await fetch("http://127.0.0.1:5000/");
    if (res.ok) setServerStatus("Online (local)", true);
    else setServerStatus("Online (no root)", true);
  } catch (e) {
    setServerStatus("Offline — run Flask", false);
  }
}

// Drag & drop + file browse
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');

browseBtn.addEventListener('click', () => fileInput.click());
dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  handleFile(f);
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
  dropArea.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    if (evt === 'drop') {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  });
});

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedDataURL = e.target.result;
    showPreview(uploadedDataURL, file.name, file.size);
  };
  reader.readAsDataURL(file);
}

function showPreview(dataURL, name = '', size = 0) {
  const preview = document.getElementById('preview');
  preview.innerHTML = `<img src="${dataURL}" alt="preview"><div class="small muted mt-2">${name} • ${bytesToKb(size)}</div>`;
}

// Reset UI
document.getElementById('resetBtn').addEventListener('click', () => {
  uploadedDataURL = null;
  document.getElementById('preview').innerHTML = '';
  document.getElementById('resultCard').hidden = true;
  document.getElementById('placeholder').hidden = false;
  document.getElementById('error').hidden = true;
});

// classify button
document.getElementById('classifyBtn').addEventListener('click', async () => {
  if (!uploadedDataURL) {
    alert('Please upload an image first.');
    return;
  }
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  loading.hidden = false;
  error.hidden = true;
  document.getElementById('placeholder').hidden = true;

  try {
    // Send only "image_data" key to the backend
    const payload = {
      image_data: uploadedDataURL
    };

    const res = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    loading.hidden = true;

    if (!Array.isArray(data) || data.length === 0) {
      error.hidden = false;
      return;
    }

    processResponse(data);
  } catch (err) {
    loading.hidden = true;
    error.hidden = false;
    console.error('Network or server error:', err);
  }
});

// Build UI from server response
function processResponse(data) {
  // find best match across all detected faces
  let best = null;
  let bestScore = -1;
  for (const obj of data) {
    const m = Math.max(...obj.class_probability);
    if (m > bestScore) {
      best = obj;
      bestScore = m;
    }
  }
  if (!best) {
    document.getElementById('error').hidden = false;
    return;
  }

  // map class_dictionary to array of {name, pct}
  const dict = best.class_dictionary || {};
  const probs = best.class_probability || [];
  const arr = [];
  for (const name in dict) {
    const idx = dict[name];
    const raw = probs[idx] || 0;
    const pct = Number(raw);
    arr.push({ name, pct });
  }
  // sort descending
  arr.sort((a, b) => b.pct - a.pct);

  // threshold filter
  const threshold = Number(document.getElementById('threshold').value);
  const topFiltered = arr.filter(x => x.pct >= threshold);

  // Update UI
  displayPrediction(best.class, bestScore, uploadedDataURL);
  displayProbabilities(topFiltered.length ? topFiltered : arr, arr);
  lastResult = { requestImage: uploadedDataURL, response: data, top: arr[0] };
  pushHistory(lastResult);
}

// Display main prediction
function displayPrediction(label, score, imageData) {
  document.getElementById('resultCard').hidden = false;
  document.getElementById('placeholder').hidden = true;
  document.getElementById('error').hidden = true;

  document.getElementById('predLabel').textContent = label.replace(/_/g, ' ');
  document.getElementById('predScore').textContent = `Highest probability: ${Number(score).toFixed(2)}%`;

  const predImage = document.getElementById('predImage');
  predImage.innerHTML = `<img src="${imageData}" alt="pred">`;
  document.getElementById('downloadJson').onclick = () => downloadJSON(lastResult || {});
  document.getElementById('copyJson').onclick = () => copyJSON(lastResult || {});
}

// Display probabilities with progress bars
function displayProbabilities(toShow, all) {
  const container = document.getElementById('probabilities');
  container.innerHTML = '';
  for (const p of toShow) {
    const pct = Number(p.pct);
    const safePct = Math.max(0, Math.min(100, isNaN(pct) ? 0 : pct));
    const row = document.createElement('div');
    row.className = 'prob-row';
    const name = document.createElement('div');
    name.className = 'name';
    name.innerText = p.name.replace(/_/g, ' ');
    const barWrap = document.createElement('div');
    barWrap.className = 'progress';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = safePct + '%';
    bar.innerText = safePct.toFixed(2) + '%';
    barWrap.appendChild(bar);
    row.appendChild(name);
    row.appendChild(barWrap);
    container.appendChild(row);
  }
}

// History in localStorage
function pushHistory(entry) {
  if (!entry) return;
  const key = 'spc_history_v1';
  let hist = JSON.parse(localStorage.getItem(key) || '[]');
  hist.unshift({ ts: Date.now(), top: entry.top, response: entry.response });
  if (hist.length > 12) hist = hist.slice(0, 12);
  localStorage.setItem(key, JSON.stringify(hist));
  renderHistory();
}

function renderHistory() {
  const key = 'spc_history_v1';
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  const hist = JSON.parse(localStorage.getItem(key) || '[]');
  if (!hist.length) {
    list.innerHTML = '<li class="muted small">No recent results</li>';
    return;
  }
  hist.forEach((h, idx) => {
    const li = document.createElement('li');
    const t = new Date(h.ts).toLocaleString();
    li.innerHTML = `<div>${h.top.name.replace(/_/g, ' ')} <small class="muted">(${t})</small></div>
                    <div><button class="btn btn-sm btn-link" data-idx="${idx}">View</button></div>`;
    li.querySelector('button').addEventListener('click', () => {
      lastResult = { response: h.response, top: h.top };
      displayPrediction(h.top.name, h.top.pct, uploadedDataURL || '');
      displayProbabilities(
        Object.keys(h.response[0].class_dictionary || {}).map(k => ({
          name: k,
          pct: h.response[0].class_probability[h.response[0].class_dictionary[k]],
        })), []
      );
    });
    list.appendChild(li);
  });
}

document.getElementById('clearHistory').addEventListener('click', () => {
  localStorage.removeItem('spc_history_v1');
  renderHistory();
});

// Download & copy utilities
function downloadJSON(obj) {
  const data = JSON.stringify(obj, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'classification_result.json'; a.click();
  URL.revokeObjectURL(url);
}

function copyJSON(obj) {
  const data = JSON.stringify(obj, null, 2);
  navigator.clipboard.writeText(data).then(() => alert('Result copied to clipboard.'));
}

// Toggle raw data display
document.getElementById('showRawBtn').addEventListener('click', () => {
  if (!lastResult) {
    alert('No result to show');
    return;
  }
  alert(JSON.stringify(lastResult.response, null, 2));
});

// Threshold control
const threshold = document.getElementById('threshold');
const thresholdLabel = document.getElementById('thresholdLabel');
threshold.addEventListener('input', () => { thresholdLabel.textContent = threshold.value + '%'; });

// Initialize on load
window.addEventListener('load', () => {
  pingServer();
  renderHistory();
});*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const SERVER_URL = "http://127.0.0.1:5000/classify_image";

let uploadedDataURL = null;
let lastResult = null;

function bytesToKb(b) { return (b / 1024).toFixed(1) + ' KB'; }

function setServerStatus(text, ok) {
  const el = document.getElementById('serverStatus');
  el.textContent = text;
  el.style.color = ok ? '#9ff' : '#ff9';
}

async function pingServer() {
  try {
    const res = await fetch("http://127.0.0.1:5000/");
    if (res.ok) setServerStatus("Online (local)", true);
    else setServerStatus("Online (no root)", true);
  } catch (e) {
    setServerStatus("Offline — run Flask", false);
  }
}

// Drag & drop + file browse
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');

browseBtn.addEventListener('click', () => fileInput.click());
dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  handleFile(f);
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
  dropArea.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    if (evt === 'drop') {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  });
});

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedDataURL = e.target.result;
    showPreview(uploadedDataURL, file.name, file.size);
  };
  reader.readAsDataURL(file);
}

function showPreview(dataURL, name = '', size = 0) {
  const preview = document.getElementById('preview');
  preview.innerHTML = `<img src="${dataURL}" alt="preview"><div class="small muted mt-2">${name} • ${bytesToKb(size)}</div>`;
}

// Reset UI
document.getElementById('resetBtn').addEventListener('click', () => {
  uploadedDataURL = null;
  document.getElementById('preview').innerHTML = '';
  document.getElementById('resultCard').hidden = true;
  document.getElementById('placeholder').hidden = false;
  document.getElementById('error').hidden = true;
});

// classify button
document.getElementById('classifyBtn').addEventListener('click', async () => {
  if (!uploadedDataURL) {
    alert('Please upload an image first.');
    return;
  }
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  loading.hidden = false;
  error.hidden = true;
  document.getElementById('placeholder').hidden = true;

  try {
    const payload = { image_data: uploadedDataURL };

    const res = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    loading.hidden = true;

    if (!Array.isArray(data) || data.length === 0) {
      error.hidden = false;
      return;
    }

    processResponse(data);
  } catch (err) {
    loading.hidden = true;
    error.hidden = true;
    console.error('Network or server error:', err);
  }
});

// --- helper: build class array from a "best" detection object ---
function buildClassArrayFromBest(best) {
  const classOrder = [
    "lionel messi",
    "michael jackson",
    "Narendra Modi",
    "Pawan Kalyan",
    "Ratan Tata",
    "Virat Kohli"
  ];

  const fixedDict = {
    "lionel messi": 1,
    "michael jackson": 2,
    "Narendra Modi": 3,
    "Pawan Kalyan": 4,
    "Ratan Tata": 5,
    "Virat Kohli": 6
  };

  const probs = best.class_probability || [];
  const classDict = best.class_dictionary || {};

  // detect if probs are 0..1 (then scale to 0..100)
  const maxProbRaw = probs.length ? Math.max(...probs) : 0;
  const scale = maxProbRaw <= 1.01 ? 100 : 1;

  const arr = [];
  for (const name of classOrder) {
    let idx;
    if (classDict && Object.prototype.hasOwnProperty.call(classDict, name)) {
      idx = classDict[name];
    } else {
      for (const k in classDict) {
        if (k.toLowerCase() === name.toLowerCase()) { idx = classDict[k]; break; }
      }
    }
    if (idx === undefined) idx = fixedDict[name];

    const raw = (idx !== undefined && probs[idx] !== undefined) ? probs[idx] : 0;
    const pct = Number(raw) * scale;
    arr.push({ name: name, pct: pct });
  }

  let top = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].pct > top.pct) top = arr[i];
  }

  return { arr, top, scale, maxProbRaw };
}

// --- process server response ---
function processResponse(data) {
  let best = null;
  let bestScoreRaw = -1;
  for (const obj of data) {
    if (!Array.isArray(obj.class_probability)) continue;
    const m = Math.max(...obj.class_probability);
    if (m > bestScoreRaw) {
      best = obj;
      bestScoreRaw = m;
    }
  }
  if (!best) {
    document.getElementById('error').hidden = false;
    return;
  }

  const { arr, top, scale } = buildClassArrayFromBest(best);
  const bestScore = Number(bestScoreRaw) * scale;

  const threshold = Number(document.getElementById('threshold').value);
  const topFiltered = arr.filter(x => x.pct >= threshold);

  displayPrediction(best.class, bestScore, uploadedDataURL);
  displayProbabilities(topFiltered.length ? topFiltered : arr, arr);

  lastResult = { requestImage: uploadedDataURL, response: data, top: top };
  pushHistory(lastResult);
}

// Display main prediction
function displayPrediction(label, score, imageData) {
  document.getElementById('resultCard').hidden = false;
  document.getElementById('placeholder').hidden = true;
  document.getElementById('error').hidden = true;

  document.getElementById('predLabel').textContent = label.replace(/_/g, ' ');
  document.getElementById('predScore').textContent = `Highest probability: ${Number(score).toFixed(2)}%`;

  const predImage = document.getElementById('predImage');
  predImage.innerHTML = `<img src="${imageData}" alt="pred">`;

  document.getElementById('downloadJson').onclick = () => downloadJSON(lastResult || {});
  document.getElementById('copyJson').onclick = () => copyJSON(lastResult || {});
}

// Display probabilities with progress bars
function displayProbabilities(toShow, all) {
  const container = document.getElementById('probabilities');
  container.innerHTML = '';
  for (const p of toShow) {
    const pct = Number(p.pct);
    const safePct = Math.max(0, Math.min(100, isNaN(pct) ? 0 : pct));
    const row = document.createElement('div');
    row.className = 'prob-row';

    const name = document.createElement('div');
    name.className = 'name';
    name.innerText = p.name.replace(/_/g, ' ');

    const barWrap = document.createElement('div');
    barWrap.className = 'progress';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = safePct + '%';
    bar.innerText = safePct.toFixed(2) + '%';

    barWrap.appendChild(bar);
    row.appendChild(name);
    row.appendChild(barWrap);

    container.appendChild(row);
  }
}

// History in localStorage
function pushHistory(entry) {
  if (!entry) return;
  const key = 'spc_history_v1';
  let hist = JSON.parse(localStorage.getItem(key) || '[]');
  hist.unshift({ ts: Date.now(), top: entry.top, response: entry.response });
  if (hist.length > 12) hist = hist.slice(0, 12);
  localStorage.setItem(key, JSON.stringify(hist));
  renderHistory();
}

function renderHistory() {
  const key = 'spc_history_v1';
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  const hist = JSON.parse(localStorage.getItem(key) || '[]');
  if (!hist.length) {
    list.innerHTML = '<li class="muted small">No recent results</li>';
    return;
  }
  hist.forEach((h, idx) => {
    const li = document.createElement('li');
    const t = new Date(h.ts).toLocaleString();
    li.innerHTML = `<div>${h.top.name.replace(/_/g, ' ')} <small class="muted">(${t})</small></div>
                    <div><button class="btn btn-sm btn-link" data-idx="${idx}">View</button></div>`;
    li.querySelector('button').addEventListener('click', () => {
      const resp = h.response || [];
      let best = null;
      let bestScoreRaw = -1;
      for (const obj of resp) {
        if (!Array.isArray(obj.class_probability)) continue;
        const m = Math.max(...obj.class_probability);
        if (m > bestScoreRaw) {
          best = obj;
          bestScoreRaw = m;
        }
      }
      if (!best) {
        alert('No data found for this history entry.');
        return;
      }
      const { arr, top, scale } = buildClassArrayFromBest(best);
      const bestScore = Number(bestScoreRaw) * scale;

      lastResult = { response: resp, top: top };
      displayPrediction(top.name, top.pct, uploadedDataURL || '');
      displayProbabilities(arr, arr);
    });
    list.appendChild(li);
  });
}

document.getElementById('clearHistory').addEventListener('click', () => {
  localStorage.removeItem('spc_history_v1');
  renderHistory();
});

// Download & copy utilities
function downloadJSON(obj) {
  const data = JSON.stringify(obj, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'classification_result.json'; a.click();
  URL.revokeObjectURL(url);
}

function copyJSON(obj) {
  const data = JSON.stringify(obj, null, 2);
  navigator.clipboard.writeText(data).then(() => alert('Result copied to clipboard.'));
}

// Toggle raw data display
document.getElementById('showRawBtn').addEventListener('click', () => {
  if (!lastResult) {
    alert('No result to show');
    return;
  }
  alert(JSON.stringify(lastResult.response, null, 2));
});

// Threshold control
const threshold = document.getElementById('threshold');
const thresholdLabel = document.getElementById('thresholdLabel');
threshold.addEventListener('input', () => { thresholdLabel.textContent = threshold.value + '%'; });

// Initialize on load
window.addEventListener('load', () => {
  pingServer();
  renderHistory();
});
