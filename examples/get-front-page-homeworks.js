const { Sigaa } = require('sigaa-api');
const sigaa = new Sigaa({
  url: 'https://sigaa.ifsc.edu.br'
});
// coloque seu usuário
const username = '';
const password = '';

const main = async () => {
  const account = await sigaa.login(username, password); // login

  /**
   * O usuário pode ter mais de um vínculo
   * @see https://github.com/GeovaneSchmitz/sigaa-api/issues/4
   **/
  const bonds = await account.getActiveBonds();

  //Para cada vínculo
  for (const bond of bonds) {
    if (bond.type !== 'student') continue; // O tipo pode ser student ou teacher

    console.log('Matrícula do vínculo: ' + bond.registration);
    console.log('Curso do vínculo: ' + bond.program);

    const activities = await bond.getFrontPageActivities();
    for (const activity of activities) {
      console.log(`${activity.course.title} -> ${activity.title}`)
      console.log(`${new Date(activity.date)}`)
    }
  }
  return await account.logoff();
};

main().catch((err) => {
  if (err) console.log(err);
});
