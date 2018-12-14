import httpService from './httpClient';

interface ResInterface {
    err: number;
    data: DataInterface;
}

interface DataInterface {
    name: string;
    age: number;
}

interface ReqDataInterface {
    type: string;
    date: Date;
}

httpService.ajax<ResInterface, ReqDataInterface>({
    url: 'dd',
    data: {
        type: '1',
        date: new Date()
    }
}).then((res) => {
    if (res.err === 0) {
        console.log(res.data.name);
    }
});