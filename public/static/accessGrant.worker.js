importScripts("/static/wasm/wasm_exec.js");

if (!WebAssembly.instantiate) {
  self.postMessage(new Error("web assembly is not supported"));
}

self.onmessage = async function (event) {
  const data = event.data;
  let result;
  let apiKey;

  switch (data.type) {
    case "Setup":
      try {
        const go = new self.Go();
        const response = await fetch("/static/wasm/access.wasm");
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        const instance = await WebAssembly.instantiate(module, go.importObject);
        go.run(instance);
        self.postMessage("configured");
      } catch (e) {
        self.postMessage(new Error(e.message));
      }
      break;
    case "DeriveAndEncryptRootKey":
      result = self.deriveAndAESEncryptRootKey(
        data.passphrase,
        data.projectID,
        data.aesKey,
      );
      self.postMessage(result);
      break;
    case "GenerateAccess":
      apiKey = data.apiKey;
      result = self.generateNewAccessGrant(
        data.satelliteNodeURL,
        apiKey,
        data.passphrase,
        data.salt,
      );
      self.postMessage(result);
      break;
    case "SetPermission":
    case "RestrictGrant": {
      const permission = self.newPermission().value;
      permission.AllowDownload = data.isDownload;
      permission.AllowUpload = data.isUpload;
      permission.AllowDelete = data.isDelete;
      permission.AllowList = data.isList;
      if (data.notBefore) permission.NotBefore = data.notBefore;
      if (data.notAfter) permission.NotAfter = data.notAfter;

      if (data.type === "SetPermission") {
        apiKey = data.apiKey;
        result = self.setAPIKeyPermission(
          apiKey,
          JSON.parse(data.buckets),
          permission,
        );
      } else {
        result = self.restrictGrant(data.grant, data.paths, permission);
      }
      self.postMessage(result);
      break;
    }
    default:
      self.postMessage(new Error("provided message event type is not supported"));
  }
};
