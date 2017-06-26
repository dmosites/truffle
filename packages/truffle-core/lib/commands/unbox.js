/*
 * returns a VCS url string given:
 * - a VCS url string
 * - a github `org/repo` string
 * - a string containing a repo under the `truffle-box` org
 */
function normalizeURL(url) {
  url = url || "https://github.com/trufflesuite/truffle-init-default";

  // full URL already
  if (url.indexOf("://") != -1) {
    return url;
  }

  if (url.split("/").length == 2) { // `org/repo`
    return "https://github.com/" + url;
  }

  if (url.indexOf("/") == -1) { // repo name only
    return "https://github.com/truffle-box/" + url;
  }

  throw new Error("Box specified in invalid format");
}

/*
 * returns a list of messages, one for each command, formatted
 * so that:
 *
 *    command key:   command string
 *
 * are aligned
 */
function formatCommands(commands) {
  var names = Object.keys(commands);

  var maxLength = Math.max.apply(
    null, names.map(function(name) { return name.length })
  );

  return names.map(function(name) {
    var spacing = Array(maxLength - name.length + 1).join(" ");
    return "  " + name + ": " + spacing + commands[name];
  });
}

var command = {
  command: 'unbox',
  description: 'Initialize new project from a Truffle Box',
  builder: {},
  run: function(options, done) {
    var Config = require("truffle-config");
    var Box = require("truffle-box");
    var OS = require("os");

    var config = Config.default().with({
      logger: console
    });

    var url = normalizeURL(options._[0]);

    Box.unbox(url, config.working_directory, {logger: config.logger})
      .then(function(boxConfig) {
        config.logger.log("Project initialized." + OS.EOL);

        var commandMessages = formatCommands(boxConfig.commands);
        if (commandMessages.length > 0) {
          config.logger.log("Commands:" + OS.EOL);
        }
        commandMessages.forEach(function(message) {
          config.logger.log(message);
        });

        if (boxConfig.epilogue) {
          config.logger.log(boxConfig.epilogue.replace("\n", OS.EOL));
        }
      });
  }
}

module.exports = command;
