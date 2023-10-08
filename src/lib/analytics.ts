

const mixpanelToken = process.env.MIXPANEL_TOKEN || ''; 

export enum Event {
  Install = "install",
  Update = "update",
  SerrvierWorkerInit = "service-worker-init",
}

const getUserIp = async () => {
  const resp = await fetch('https://api.ipify.org?format=json')
  const data = await resp.json();
  return data?.ip;
}

// track event
export const track = async (event: string, props?: any) => {
   
  const ip = await getUserIp();

  const payload: any = [{
    event,
    properties: {
      ...props,
      distinct_id: 'user-id',
      ip,
      token: mixpanelToken,
    },
  }]


  const resp = await fetch(`https://api.mixpanel.com/track`, {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify(payload),
  })

  const data = await resp.json();
}
