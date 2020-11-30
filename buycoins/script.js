//Github Data
const fullName  = document.querySelector('.name');
const email     = document.querySelector('.email');
const followers = document.querySelector('.followers');
const following = document.querySelector('.following');
const starred   = document.querySelector('.starred');
const repoList  = document.querySelector('.repo-list ul');
const avatars   = document.querySelectorAll('.avatar');
const userName  = document.querySelectorAll('.username');
const totalRepo = document.querySelectorAll('.total-repo');

getUserProfileDetails('kunbimajek', (data) => {
  console.log(data.user);
  fullName.textContent    = data.user.name;
  email.textContent       = data.user.email;
  followers.textContent   = data.user.followers.totalCount;
  following.textContent   = data.user.following.totalCount;
  starred.textContent     = data.user.starredRepositories.totalCount;
  avatars.forEach((image) => { image.src = data.user.avatarUrl; });
  userName.forEach((name) => { name.textContent = data.user.login; });
  totalRepo.forEach((total) => { total.textContent = data.user.repositories.totalCount; });

  let list  = "";
  data.user.repositories.nodes.forEach(repo => {
    const descriptionHtml = repo.shortDescriptionHTML !== "" ?
      `<div class="d-inline-block text-light">
          <p class="mt-0 mb-8 repo-description">${repo.shortDescriptionHTML}</p>
      </div>` :
      '';

    const languageHtml = repo.languages.nodes.length > 0 ?
      `<span class="mr-sm-16">
          <span class="language-color" style="background-color:${repo.languages.nodes[0].color}"></span>
          <span class="language font-12">${repo.languages.nodes[0].name}</span>
      </span>` : 
      '';

    const stargazerTotal = repo.stargazerCount > 0 ?
      `<a class="mr-sm-16 font-12 text-light" href="/unicodeveloper/awesome-opensource-apps/stargazers">
        <svg aria-label="star" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16" role="img"><path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path></svg>
        ${repo.stargazerCount}
      </a>` : 
      '';

    const privateHtml = repo.isPrivate ?
      '<span class="repo-label text-light font-12 v-align-middle">Private</span>' :
      '';
    
    const today = new Date();
    const lastPushDate = new Date(repo.pushedAt);
    const diffInDays = getDaysBetween(lastPushDate, today);

    let dateString = 'Updated ';
    if (diffInDays < 1) {
      const diffInHours = getHoursBetween(lastPushDate, today);
      dateString += `${diffInHours} ${diffInHours ===  1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 31) {
      dateString += `${diffInDays} ${diffInDays === 1 ? 'day': 'days'} ago`;
    } else if (diffInDays < 365) {
      dateString += `on ${lastPushDate.getDate()} ${getShortMonth(lastPushDate)}`;
    } else {
      dateString += `on ${lastPushDate.getDate()} ${getShortMonth(lastPushDate)} ${lastPushDate.getFullYear()}`;
    }

    const forkCount = repo.isFork ? repo.parent.forkCount : repo.forkCount;
    
    list += 
    `<li class="width-100 py-24 bdr-btm">
        <div class="row d-flex">
            <div class="col-10">
                <div class="mb-4 d-inline-block">
                    <h3 class="m-0">
                        <a class="font-20 text-blue repo-title" href="${repo.url}">
                        ${repo.name}</a>
                        ${privateHtml}
                    </h3>
                </div>
                ${descriptionHtml}
                <div class="mt-8 text-light">
                    ${languageHtml}
                    ${stargazerTotal}
                    <span class="font-12 no-wrap">${dateString}</span>
                </div>
            </div>
            <div class="col-2 align-sm-center">
                <div class="text-right">
                    <button class="btn-starred">
                        <svg class="icon mr-1" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path></svg>
                        Star
                    </button>
                </div>
            </div>
        </div>
    </li>`;
  });
  
  repoList.innerHTML = list;
});

function getUserProfileDetails(username, callback) {
  const query = getGithubGraphQLUserQuery();
  const variables = {
    username: username
  };

  sendGraphQLRequest(query, variables, callback);
}

function sendGraphQLRequest(query, variables = {}, callback) {
  const url = 'https://api.github.com/graphql';
  const data = JSON.stringify({
    query: query,
    variables: variables
  });
  const authToken = '10094fd7efbc519ac506b674aeed812d032e81d7';

  fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: data
  }).then(res => res.json())
    .then(profile => {
      callback(profile.data);
    });
}

function getGithubGraphQLUserQuery() {
  const lastYearDate = new Date();
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);

  return `query($username: String!) {
    user(login: $username) {
      avatarUrl
      name
      login
      bioHTML
      followers {
        totalCount
      }
      following {
        totalCount
      }
      starredRepositories {
        totalCount
      }
      location
      email
      websiteUrl
      twitterUsername
      repositories(
        first: 20,
        ownerAffiliations: OWNER,
        orderBy: {
          field: PUSHED_AT
          direction: DESC
        }
      ) {
        totalCount
        nodes {
          url
          name
          isFork
          isPrivate
          parent {
            url
            nameWithOwner
            forkCount
          }
          shortDescriptionHTML
          repositoryTopics(first: 7) {
            nodes {
              topic {
                name
              }
              url
            }
          }
          languages(
            first: 1, 
            orderBy: {
              field: SIZE,
              direction: DESC
            }
          ) {
            nodes {
              color
              name
            }
          }
          stargazerCount
          forkCount
          licenseInfo {
            name
            nickname
          }
          pushedAt
        }
      }
    }
  }`;
}

function getDaysBetween(startDate, endDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((endDate - startDate) / millisecondsPerDay);
}

function getHoursBetween(startDate, endDate) {
  const millisecondsPerHour = 60 * 60 * 1000;
  return Math.round(Math.abs(endDate - startDate) / millisecondsPerHour);
}

function getShortMonth(date) {
  return date.toLocaleString('default', { month: 'short' });
}

//menu toggler
const toggler = document.querySelector('.toggle-button');
const menu = document.querySelector('.mobile-menu');

toggler.addEventListener('click', () => {
    menu.classList.toggle('d-sm-none')
});

//header text responsiveness
const text = document.querySelector('.textResize');
const mediaQuery = 'screen and (min-width: 767px) and (max-width: 1011px)';

window.addEventListener('resize', () => {
    if (window.matchMedia(mediaQuery).matches) {
        text.textContent = 'Pulls';
    } else {
        text.textContent = 'Pull requests';
    }
});

//header input click functionality
const search = document.querySelector('.header-search');
const searchWrapper = document.querySelector('.wrapper');
const slash = document.querySelector('.search-slash');

document.addEventListener('click', e => {
  const isClickInside = searchWrapper.contains(e.target);
  if (isClickInside) {
    slash.classList.add('d-none');
    search.classList.add('search-focus');
  } else {
    slash.classList.remove('d-none');
    search.classList.remove('search-focus');
  }
});

//mini profile functionality
window.addEventListener("scroll", (e) => {
  const miniDetails  = document.querySelector('.user-details-mini');
  // console.log(e)
  var y = scrollY;
  if (y >= 380) {
    miniDetails.classList.remove('opacity-0')
  } else {
    miniDetails.classList.add('opacity-0')
  }
});

