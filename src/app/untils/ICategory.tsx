export interface ICategory{
_id:string,
name:string,
slug:string,
image: string | null;
parentId: string | '';
images?: [] 
type?: string; // ← thêm dòng này

}