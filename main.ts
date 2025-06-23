import axios from 'axios';

const BASE_URL = 'https://hire-game.pertimm.dev';
const email = 'abdallah.rahal15@gmail.com';
const first_name = 'Abdallah';
const last_name = 'Rahal';
let token = '';

async function register() {
    try {
        await axios.post(`${BASE_URL}/api/v1.1/auth/register/`, {
            email,
            password1: 'Abdallah_1234',
            password2: 'Abdallah_1234',
        });
    } catch (error: any) {
        console.error('Erreur dans register ', error.response?.data || error.message);
    }
}

async function login() {
    try {
        const response = await axios.post(`${BASE_URL}/api/v1.1/auth/login/`, {
            email,
            password: 'Abdallah_1234',
        });
        console.log('response BODY: ', response.data)
        token = response.data.token;
    } catch (error: any) {
        console.error('Erreur dans login ', error.response?.data || error.message);
    }

}

async function createApplication() {
    try {
        const body = {
            email,
            first_name,
            last_name,
        }
        console.log('Body : ', body)
        console.log('Token  : ', token)
        const response = await axios.post(
            `${BASE_URL}/api/v1.1/job-application-request/`,
            body,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );
        const url = response.data.url;
        console.log('Application créée avecURL : ', url)
        return url;
    } catch (error: any) {
        console.error('Erreur dans createApplication ', error.response?.data || error.message);
    }
}

async function waitForCompletion(url: string): Promise<string> {
    const start = Date.now();
    let x = 0
    console.log('Debut de la completion')
    while (true) {
        x++
        const response = await axios.get(url, {
            headers: { Authorization: `Token ${token}` },
        });

        const status = response.data.status;
        console.log('Tentative : ' + x + ' => réponse : ', status)
        if (status === 'COMPLETED') {
            return response.data.confirmation_url;
        }

        if (Date.now() - start > 25000) {
            throw new Error('Temps écoulé');
        }

        await new Promise((res) => setTimeout(res, 2000));
    }
}

async function confirmApplication(confirmationUrl: string) {
    const response = await axios.patch(
        confirmationUrl,
        { confirmed: true },
        { headers: { Authorization: `Token ${token}` } }
    );
    console.log('Réponse : ', response.status, response.data);
}

async function main() {
    try {
        //console.log('Envoi du register')
        // await register();

        console.log('Envoi du login')
        await login();

        console.log('Envoi du createAppli')
        const url = await createApplication();

        console.log('Envoi du waitForCompletion')
        const confirmationUrl = await waitForCompletion(url);

        console.log('Envoi du confirmApplication')
        await confirmApplication(confirmationUrl);

    } catch (err) {
        console.error('Erreur main : ', err);
    }
}

main();
