import DiscoverCarsSearchUtil from "../carSearchUtils/DiscoverCarsSearchUtil"
import SurpriceCarsSearchUtil from "../carSearchUtils/SurpriceCarsSearchUtil"

export const GetSerchForClients = (ids: string[]) => {
    const search: {[k: string]: any} = {
        "37": SurpriceCarsSearchUtil,
        "17": DiscoverCarsSearchUtil,
    }


    return ids.reduce<any[]>((arr, next) => {
        if (search[next]) {
            arr.push(search[next])
        }

        return arr

    },[])

}