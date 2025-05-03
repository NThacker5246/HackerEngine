// ConsoleApplicationTest.cpp : Этот файл содержит функцию "main". Здесь начинается и заканчивается выполнение программы.
//

#include <iostream>
#include <SFML/Graphics.hpp>

#include <fstream>

#define FOR(t, count) for(int t = 0; t < count; t++)
#define w 800


int32_t num[12800];

int main()
{
	std::ofstream fcnt;

	int framesStill = 1;
	
	sf::Vector2f mouseP = sf::Vector2f(0.0f, 0.0f);

	sf::Vector3f pos = sf::Vector3f(-10.0f, 0.0f, 0.0f);

	sf::RenderWindow window(sf::VideoMode(w, w), "HackerEngine: Test", sf::Style::Titlebar | sf::Style::Close);
	window.setFramerateLimit(60);

	sf::RenderTexture firstTexture;
	firstTexture.create(w, w);
	sf::Sprite firstTextureSprite = sf::Sprite(firstTexture.getTexture());
	sf::Sprite firstTextureSpriteFlipped = sf::Sprite(firstTexture.getTexture());
	firstTextureSpriteFlipped.setScale(1, -1);
	firstTextureSpriteFlipped.setPosition(0, w);

	sf::RenderTexture outputTexture;
	outputTexture.create(w, w);
	sf::Sprite outputTextureSprite = sf::Sprite(outputTexture.getTexture());
	sf::Sprite outputTextureSpriteFlipped = sf::Sprite(firstTexture.getTexture());
	outputTextureSpriteFlipped.setScale(1, -1);
	outputTextureSpriteFlipped.setPosition(0, w);

	sf::Shader shader;
	shader.loadFromFile("output.frag", sf::Shader::Fragment);
	//shader.setUniform("u_resolution", sf::Vector2f(w, h));
	bool flag = 0;
	int sampler = 0;
	std::cout << "SAMPLES: ";

	while (window.isOpen())
	{
		sf::Event event;
		while (window.pollEvent(event))
		{
			if (event.type == sf::Event::Closed)
			{
				window.close();
			}
			else if (event.type == sf::Event::MouseMoved)
			{
				int mx = event.mouseMove.x - w / 2;
				int my = event.mouseMove.y - w / 2;
				mouseP.x += mx * 0.0125;
				mouseP.y += my * 0.0125;
				sf::Mouse::setPosition(sf::Vector2i(w / 2, w / 2), window);
				if (mx != 0 || my != 0) framesStill = 1;
				shader.setUniform("u_mouse", mouseP);
			}
			else if (event.type == sf::Event::KeyPressed)
			{
				if (event.key.code == sf::Keyboard::O) {
					shader.setUniform("u_action", sf::Int8(flag));
					flag = !flag;
					if (!flag == true) {
						pos.x = 0;
						pos.y = 0;
						pos.z = -10;
						mouseP.x = 0;
						mouseP.y = 1.570785f;
						shader.setUniform("u_mouse", mouseP);
					}
	
				}

				if (event.key.code == sf::Keyboard::I) {
					sf::Texture text = firstTexture.getTexture();
					sf::Image text1 = text.copyToImage();

					FOR(y, w) {
						FOR(x, w) {
							sf::Color col = text1.getPixel(x, y);
							if (col.g > 0.1f) {
								//there white
								int position = y * w + x;
								int offset = position & 31;
								int nt = position >> 5;
								num[nt] |= 1 << offset;
							}
							else {
								int position = y * w + x;
								int offset = position & 31;
								int nt = position >> 5;
								num[nt] &= ~(1 << offset);
								continue;
							}
						}
					}
					fcnt.open("setpoint" + std::to_string(sampler) + ".txt");
					if (fcnt.is_open()) {
						int ttd = 0;
						int cnd = 0;
						FOR(t, 12800) {
							if (ttd == num[t]) {
								cnd += 1;
							} else {
								if (cnd != 0) {
									fcnt << cnd;
									cnd = 0;
								}
								ttd = num[t];
								char c1 = num[t] & 255;
								char c2 = (num[t] >> 8) & 255;
								char c3 = (num[t] >> 16) & 255;
								char c4 = num[t] >> 24;
								fcnt << c1;
								fcnt << c2;
								fcnt << c3;
								fcnt << c4;
							}
							
						}
					}
					fcnt.close();
					sampler += 1;
					pos.z += 0.01f;
				}


				sf::Vector3f dir = sf::Vector3f(0.0, 0.0, 0.0);
				if (event.key.code == sf::Keyboard::W) {
					dir.x += 0.1f;
				}
				if (event.key.code == sf::Keyboard::S) {
					dir.x -= 0.1f;
				}
				if (event.key.code == sf::Keyboard::A) {
					dir.y -= 0.1f;
				}
				if (event.key.code == sf::Keyboard::D) {
					dir.y += 0.1f;
				}
				if (event.key.code == sf::Keyboard::Space) {
					dir.z -= 0.1f;
				}
				if (event.key.code == sf::Keyboard::X) {
					dir.z += 0.1f;
				}

				float mx = mouseP.x;

				dir.x = dir.x * cos(mx) - dir.y * sin(mx);
				dir.y = dir.x * sin(mx) + dir.y * cos(mx);
				pos += dir;
			}
		}

		shader.setUniform("u_pos", pos);

		if (framesStill % 2 == 1)
		{
			//shader.setUniform("u_sample", firstTexture.getTexture());
			outputTexture.draw(firstTextureSpriteFlipped, &shader);
			window.clear();
			window.draw(outputTextureSprite);
		}
		else
		{
			//shader.setUniform("u_sample", outputTexture.getTexture());
			firstTexture.draw(outputTextureSpriteFlipped, &shader);
			window.clear();
			window.draw(firstTextureSprite);
		}

		window.display();
		framesStill++;
	}

	return 0;
}

// Запуск программы: CTRL+F5 или меню "Отладка" > "Запуск без отладки"
// Отладка программы: F5 или меню "Отладка" > "Запустить отладку"

// Советы по началу работы 
//   1. В окне обозревателя решений можно добавлять файлы и управлять ими.
//   2. В окне Team Explorer можно подключиться к системе управления версиями.
//   3. В окне "Выходные данные" можно просматривать выходные данные сборки и другие сообщения.
//   4. В окне "Список ошибок" можно просматривать ошибки.
//   5. Последовательно выберите пункты меню "Проект" > "Добавить новый элемент", чтобы создать файлы кода, или "Проект" > "Добавить существующий элемент", чтобы добавить в проект существующие файлы кода.
//   6. Чтобы снова открыть этот проект позже, выберите пункты меню "Файл" > "Открыть" > "Проект" и выберите SLN-файл.
