# SIGAA-API

## ARQUIVAMENTO

A bastante tempo este projeto não sobre atualizações, e por isso, estou arquivando ele.
Eu já terminei o meu curso no IFSC, além disso a minha vida profissional me tomou bastante tempo e sinto que já passou o momento deste projeto.

Eu acho que este projeto compriu o seu objetivo, e eu fico feliz por ter ajudado algumas pessoas.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/1ed3e89858204acdb2307febc87da74c)](https://www.codacy.com/gh/GeovaneSchmitz/sigaa-api/dashboard?utm_source=github.com&utm_medium=referral&utm_content=GeovaneSchmitz/sigaa-api&utm_campaign=Badge_Grade)

Uma biblioteca de Web Scraping, para acessar o SIGAA (Sistema Integrado de Gestão de Atividades Acadêmicas), ela é a API mais completa disponível no Github. Tem suporte a vários recursos, desde notas, notícias e informações das turmas, lista de atividades, até download de arquivos, foto de perfil e E-mail.

Atualmente, ela já foi testada no IFSC (Instituto Federal de Santa Catarina), IFFar (Instituto Federal Farroupilha) e na UFPB (Universidade Federal da Paraíba).

Caso precise de suporte para alguma instituição ou algum recurso, não se acanhe, você será bem atendido. ;-)

### O que ela já faz

Embora não seja oficial, permite o acesso a vários itens:

- Listar suas turmas
- Ver suas faltas e notas
- Alterar a sua senha
- Ver a sua foto de perfil, de seus colegas e seus professores
- Ver os membros da turmas
- Procurar por docentes pelo nome ou pelo campus
- Baixar todos os arquivos disponibilizado pelos seus professores
- Ver as noticias publicadas nas turmas
- Ver os planos de ensinos, atendimento, referências bibliográficas, etc

### Caso de uso

Ela é usada em um [bot](https://github.com/GeovaneSchmitz/SIGAA-telegram-integration) para o telegram.

### Como usar:

- Instalar o nodejs;
- Criar um projeto com o node, pode ser feito com `npm init`;
- Instalar este pacote como dependência `npm install sigaa-api` ou `yarn add sigaa-api`;
- Escrever algum script, você pode ver alguns exemplos [aqui](https://github.com/GeovaneSchmitz/sigaa-api/tree/master/examples) ou ver a [documentação](https://geovaneschmitz.github.io/sigaa-api/);
- Executar o seu script com o nodejs.

![Exemplo 1 - Saída do Terminal](https://raw.githubusercontent.com/GeovaneSchmitz/sigaa-api/master/Exemplo1.webp 'Exemplo 1 - Saída do Terminal')

#### Exemplo 1 - Saída do terminal do exemplo [search-teacher.js](https://github.com/GeovaneSchmitz/sigaa-api/blob/master/examples/search-teacher.js)
