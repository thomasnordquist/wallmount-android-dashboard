cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "org.apache.cordova.shell-exec.shell-exec",
      "file": "plugins/org.apache.cordova.shell-exec/www/shell-exec.js",
      "pluginId": "org.apache.cordova.shell-exec",
      "clobbers": [
        "shell-exec"
      ]
    },
    {
      "id": "cordova-plugin-networkinterface.networkinterface",
      "file": "plugins/cordova-plugin-networkinterface/www/networkinterface.js",
      "pluginId": "cordova-plugin-networkinterface",
      "clobbers": [
        "window.networkinterface"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.3",
    "org.apache.cordova.shell-exec": "1.0.0",
    "cordova-plugin-networkinterface": "2.0.0"
  };
});