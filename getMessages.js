const MFA_TOKEN = "";
const GUILD_ID = "910961041003913216"; // Concave Server ID
const CHANNEL_ID = "914614393218682891"; // ALPHA/PSYOPS CHANNEL ID
const MINER_ID = "891752689036296201"; // MINER THAT YOU WANT TO SEARCH UP THE HISTORY FOR
// 891752689036296201 CameronD

const axios = require("axios");

function sleep(delay) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

class DiscordInstance {
  constructor(token, guildID, channelID) {
    this.guildID = guildID;
    this.channelID = channelID;
    this.token = token;
    this.headers = {
      authorization: this.token,
      "accept-encoding": "gzip, deflate",
    };
    this.allMessages = [];
    this.author = "";
  }

  // Method
  async getMessages(authorID) {
    let allMessages = [];
    let pageNum = 0;
    // const pageParam = "&offset=";
    let url = `https://discord.com/api/v9/guilds/${this.guildID}/messages/search?author_id=${authorID}&channel_id=${this.channelID}`;
    try {
      while (true) {
        // let getUrl =
        //   "https://discord.com/api/v9/guilds/910961041003913216/messages/search?author_id=853367735739351070&channel_id=914614393218682891&offset=25";
        const offset = pageNum * 25;
        const getUrl = pageNum === 0 ? url : url + `&offset=${String(offset)}`;
        console.log(getUrl);
        const res = await axios.get(getUrl, {
          headers: this.headers,
        });
        console.log(`statusCode: ${res.status}`);
        if (res.status === 200) {
          const { messages, total_results, threads } = res.data;
          console.log("messages coming in now", messages.length);

          if (messages.length > 0) {
            const msgs = messages.map(function (m, i) {
              let message = m[0];
              const threadName = threads.find(
                (t) => t.id === message.channel_id
              );
              message.threadName = threadName.name;
              return message;
            });
            allMessages = allMessages.concat(msgs);

            console.log("total messages", total_results);
            console.log("total messages so far", allMessages.length);
            pageNum += 1;
            sleep(2000);
          } else if (messages.length === 0) {
            console.log(total_results);
            console.log(allMessages.length);
            // console.log(allMessages[allMessages.length - 1]);
            this.allMessages = allMessages;
            this.author = allMessages[0].author.username;
            return;
          }
        }
      }
    } catch (error) {
      console.log(
        "---------------------------------------------------------------"
      );
      console.log("ERROR");
      console.log(error.response.data);
      console.log(
        "---------------------------------------------------------------"
      );
      console.log(
        "PLEASE CHECK THAT YOUR TOKEN IS VALID OR MAKE SURE THAT YOU HAVE ACCESS TO THE ALPHA/PSYOPS CHANNEL"
      );
    }
  }

  getStats() {
    console.log(
      "---------------------------------------------------------------"
    );
    if (!this.allMessages || this.allMessages.length === 0) {
      console.log("NO MESSAGES TO GET STATS ON");
      return;
    }
    const numberThreadsParticipated = new Set(
      this.allMessages.map((m) => m.threadName)
    ).size;
    const totalThreads = 207;
    console.log("TOTAL NUMBER OF THREADS IN ALPHA/PSYOPS: ", totalThreads);
    console.log(
      `TOTAL SUBMISSIONS IN ALPHA/PSYOPS FOR MINER ${this.author}: `,
      this.allMessages.length
    );
    const moreThan10Words = new Set(
      this.allMessages
        .filter((m) => m.content.length > 10)
        .map((m) => m.threadName)
    ).size;
    console.log(
      "NUMBER OF UNIQUE THREADS PARTICIPATED IN: ",
      numberThreadsParticipated
    );

    const percentage = Math.round(
      (numberThreadsParticipated / totalThreads) * 100
    );
    console.log("PERCENTAGE OF PARTICIPATION: ", percentage, "%");
    console.log("NUMBER OF THREADS WITH MORE THAN 10 WORDS: ", moreThan10Words);
  }
}

(async () => {
  const discordInstance = new DiscordInstance(MFA_TOKEN, GUILD_ID, CHANNEL_ID);
  // await discordInstance.login();
  console.log(discordInstance.token);
  await discordInstance.getMessages(MINER_ID); // 891752689036296201 CameronD
  await discordInstance.getStats();
})();
