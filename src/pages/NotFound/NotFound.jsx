import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container
      sx={{
        textAlign: 'center',
        py: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '150px'
      }}
    >
      <img
        src="https://cdni.iconscout.com/illustration/premium/thumb/file-not-found-6992077-5736065.png?f=webp"
        alt="404 Not Found"
        style={{ maxWidth: '400px', marginBottom: '20px' }}
      />
      <Typography variant="h3" gutterBottom>
        404 - Không tìm thấy trang
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
      >
        Quay lại trang chủ
      </Button>
    </Container>
  );
}
