
//Params socket sẽ được lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (socket) => {
  // Lắng nghe sự kiện mà FE emit() lên có tên là : FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
  // Cách làm nhanh và đơn giản là Emit() ngược lại một sự kiện về cho mọi client khác ( ngoại trừ chính cái thằng request lên), rồi để FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
