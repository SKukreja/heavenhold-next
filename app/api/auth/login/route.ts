import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Extract the token from the query parameter
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect('/login?error=missing_token');
    }

    // Verify the token by making a request to WordPress API
    const response = await fetch('https://api.heavenhold.com/wp-json/custom/v1/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return NextResponse.redirect('/login?error=invalid_token');
    }

    const userData = await response.json();

    // Redirect to the homepage
    const res = NextResponse.redirect('/');

    // Set the session cookie using response.cookies
    res.cookies.set('session', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });      

    return res;
  } catch (err) {
    console.error('Token verification failed:', err);
    return NextResponse.redirect('/login?error=verification_failed');
  }
}
