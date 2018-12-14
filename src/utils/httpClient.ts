interface HeaderOption {
    [propName: string]: string;
}

class HttpService {
    ajax<T, U = {}>(options: {
        url: string,
        data?: U,
        headers?: HeaderOption,
        type?: string,
        timeout?: number
    }): Promise<T> {
        const { url, data = {}, headers = {}, type = 'POST', timeout = 20000 } = options;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const isGET = type.toLowerCase() === 'get';
            let reqURL = url;
            let paramsStr = '';
            let reqParams = null;

            if (isGET) {
                paramsStr = Object.keys(data)
                    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
                    .join('&');
                if (paramsStr) {
                    reqURL += (reqURL.indexOf('?') === -1 ? '?' : '&') + paramsStr;
                }
            } else {
                reqParams = JSON.stringify(data);
            }
            xhr.open(type.toUpperCase(), reqURL, true);
            xhr.timeout = timeout || 20000;
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            Object.keys(headers).forEach((key) => xhr.setRequestHeader(key, headers[key]));
            xhr.onload = () => {
                try {
                    resolve(JSON.parse(xhr.responseText) as T);
                } catch (e) {
                    reject(e);
                }
            };
            xhr.onerror = (error) => reject(error);
            xhr.ontimeout = (error) => reject(error);

            xhr.send(JSON.stringify(reqParams));
        });
    }
}

const httpService = new HttpService();

export default httpService;