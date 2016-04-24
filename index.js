import fs from 'fs';
import FB from 'facebook-node';
import equals from 'deep-equal';
import Github from 'github-api';
import promisify from 'promisify-node';
const GH = promisify(Github);

try {
  FB.setAccessToken(`${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`);
  let github = new GH({
    token: process.env.GITHUB_TOKEN,
    auth: "oauth"
  });
  let repo = github.getRepo('coconut-queen', 'guidetokulchur.github.io');
  //repo = promisify(repo);

  FB.api('GuideToKulchurCleveland/events',
  { fields: ['id', 'name', 'start_time', 'end_time', 'place', 'picture', 'description', 'cover'] },
  async(res) => {
    if(!res || res.error) {
       console.log(!res ? 'error occurred' : res.error);
       process.exit(1);
    }
    try {
     if (res.data  && res.data.length) {
       const today = new Date().toISOString();

       const events = res.data.filter( event => {
         return event.start_time > today
       });
       await writeDataToGithub(events);
      //  fs.writeFileSync('_data/events.json', JSON.stringify(events, null, 2))
      //  console.log(`${events.length} event(s) written to _data/events.json`);
       process.exit(0);
      }
    }
    catch (err) {
      throw new Error(err);
      process.exit(1);
    }
  });

  async function writeDataToGithub(events) {
    try {
      console.log(events.length);
      repo.read('master', '_data/events.json', (err, res) =>{
        if (err) throw new Error(err);
        else console.log(res);
      });
      console.log(remoteEvents);

      const needsUpdate = equals(events, remoteEvents.content) ? true : false;
      if (needsUpdate){
        const options = {
          author: {name: 'Automated Event Updater', email: 'richard.j.schulte@gmail.com'},
          committer: {name: 'Automated Event Updater', email: 'richard.j.schulte@gmail.com'},
          encode: true // Whether to base64 encode the file. (default: true)
        }
        await repo.write('master', '_data/events.json', events.toString("bas64"), `Added/updated ${events.length} on guidetkulchur.com`, options);
        await console.log("Wrote to remote repo")
      } else {
        console.log("Events already up to date.")
      }
    }
    catch (err){
      throw new Error(err);
    }
  }
}
catch (err) {
  console.err(err);
}
