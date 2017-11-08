import {environment} from '../environments/environment';

export const key = environment.production ? '6f8e13;F2Ab@E*)>0[}4B5#7C^9' : '6f8e13;F2Ab@E*)>0[}4B5#7C^9';

export const back = environment.production ? 'http://localhost:3000' : 'http://localhost:3000';

export const auth_params = {
  client_id: 2,
  client_secret: 'ABjSJ4330mk7uOo148q9z0xZMgxUPciYiipFZFXV',
  grant_type: 'password',
  scope: '*'
};
