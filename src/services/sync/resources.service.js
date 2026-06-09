function matchesResource(url, resource) {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

  return new RegExp(`/${resource}(/|$)`).test(normalizedUrl);
}

export default function handlerSync(method, url) {
  const normalizedMethod = method.toLowerCase();

  const resourcesThatAffectLimits = [
    {
      resource: 'dashboard',
      methods: ['get']
    },
    {
      resource: 'users',
      methods: ['post', 'put', 'patch', 'delete']
    },
    {
      resource: 'teams',
      methods: ['post', 'put', 'patch', 'delete']
    },
    {
      resource: 'events',
      methods: ['post', 'put', 'patch', 'delete']
    },
    {
      resource: 'companies',
      methods: ['post', 'put', 'patch', 'delete']
    },
    {
      resource: 'plans',
      methods: ['post', 'put', 'patch', 'delete']
    }
  ];

  return resourcesThatAffectLimits.some(
    ({ resource, methods }) =>
      matchesResource(url, resource) && methods.includes(normalizedMethod)
  );
}
