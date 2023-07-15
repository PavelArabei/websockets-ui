export const generateResponse = <Type, Data>(type: Type, data: Data): { type: Type; data: Data; id: 0 } => {
  return { type: type, data: data, id: 0 }
}
