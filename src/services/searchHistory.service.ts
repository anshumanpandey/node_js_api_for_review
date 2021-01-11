import { DB } from "../utils/DB"
import { SearchHistoryEnum } from "../utils/SearchHistoryEnum";

export const increaseCounterFor = async ({ clientId, searchType }: { clientId: string, searchType: SearchHistoryEnum }) => {
    const record = await DB?.select().from("OtaSearchHistory")
        .where("clientId", clientId)
        .where("searchType", searchType);

        if (!record || record.length == 0) {
            return DB?.insert({ clientId, searchType, searchCounter: 1 }).into('OtaSearchHistory')
        } else {
            return DB?.where('ClientId', '=', clientId)
                    .increment('searchCounter', 1)
                    .from("OtaSearchHistory")
        }
}

export const sortClientsBySearch= async ({ clients, searchType }: { clients: any[], searchType: SearchHistoryEnum }) => {
    const records = await DB?.select()
        .from("OtaSearchHistory")
        .whereIn("clientId", clients.map(r => r.id || r))
        .where("searchType", searchType);

    return clients
        .map((r) => {
            const found = records?.find(el => el.ClientId == r.id)
            if (!found) {
                return { ...r, searchCounter: 0}   
            }
            return { ...r, searchCounter: found.searchCounter}
        })
        .sort((a,b) => a.searchCounter - b.searchCounter)
}